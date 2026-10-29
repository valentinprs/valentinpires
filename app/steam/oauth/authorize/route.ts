import {
  BASE_PATH,
  LOGIN_STATE_TTL,
  SCOPE,
  getOrigin,
  getResourceUrl,
} from '@/lib/steam-mcp/config'
import {
  STEAM_OPENID_ENDPOINT,
  escapeHtml,
  htmlPage,
  resolveClient,
} from '@/lib/steam-mcp/oauth'
import { signToken } from '@/lib/steam-mcp/tokens'

export async function GET(req: Request) {
  const origin = getOrigin(req)
  const params = new URL(req.url).searchParams
  const clientId = params.get('client_id')
  const redirectUri = params.get('redirect_uri')

  // Without a trusted client + redirect_uri, errors must not be redirected.
  const client = clientId ? await resolveClient(clientId) : null
  if (!client) {
    return htmlPage(
      'Unknown client',
      '<h1>Unknown client</h1><p>This application is not registered. Try reconnecting from your MCP client.</p>',
      400,
    )
  }
  if (!redirectUri || !client.redirect_uris.includes(redirectUri)) {
    return htmlPage(
      'Invalid redirect',
      '<h1>Invalid redirect URI</h1><p>The redirect URI does not match this application.</p>',
      400,
    )
  }

  const state = params.get('state')
  const redirectError = (error: string, description: string) => {
    const url = new URL(redirectUri)
    url.searchParams.set('error', error)
    url.searchParams.set('error_description', description)
    if (state) url.searchParams.set('state', state)
    url.searchParams.set('iss', origin)
    return Response.redirect(url, 302)
  }

  if (params.get('response_type') !== 'code') {
    return redirectError('unsupported_response_type', 'Only "code" is supported')
  }
  const codeChallenge = params.get('code_challenge')
  if (!codeChallenge || params.get('code_challenge_method') !== 'S256') {
    return redirectError('invalid_request', 'PKCE with S256 is required')
  }
  const resource = params.get('resource')
  if (resource && resource.replace(/\/$/, '') !== getResourceUrl(origin)) {
    return redirectError('invalid_target', 'Unknown resource')
  }

  const login = await signToken(
    'login',
    {
      client_id: client.client_id,
      redirect_uri: redirectUri,
      code_challenge: codeChallenge,
      state: state ?? undefined,
      scope: SCOPE,
    },
    LOGIN_STATE_TTL,
  )

  const steamLogin = new URL(STEAM_OPENID_ENDPOINT)
  steamLogin.search = new URLSearchParams({
    'openid.ns': 'http://specs.openid.net/auth/2.0',
    'openid.mode': 'checkid_setup',
    'openid.return_to': `${origin}${BASE_PATH}/oauth/callback?login=${login}`,
    'openid.realm': origin,
    'openid.identity': 'http://specs.openid.net/auth/2.0/identifier_select',
    'openid.claimed_id': 'http://specs.openid.net/auth/2.0/identifier_select',
  }).toString()

  // Consent screen: Steam's own login page only shows this server's domain,
  // so name the requesting app and where the user will be sent back.
  const appName = escapeHtml(client.client_name ?? 'An MCP client')
  const redirectHost = escapeHtml(new URL(redirectUri).host || redirectUri)
  return htmlPage(
    'Connect your Steam account',
    `<h1>Connect your Steam account</h1>
<p><strong>${appName}</strong> wants read-only access to your Steam library and achievements. You will be sent back to <code>${redirectHost}</code>.</p>
<p>Your Steam password is never shared: you sign in on steamcommunity.com. Your profile and game details must be public.</p>
<a class="button" href="${escapeHtml(steamLogin.toString())}">Sign in through Steam</a>`,
  )
}
