import { AUTH_CODE_TTL, BASE_PATH, getOrigin } from '@/lib/steam-mcp/config'
import { STEAM_OPENID_ENDPOINT, htmlPage } from '@/lib/steam-mcp/oauth'
import { signToken, verifyToken } from '@/lib/steam-mcp/tokens'

type LoginClaims = {
  client_id: string
  redirect_uri: string
  code_challenge: string
  state?: string
  scope: string
}

const CLAIMED_ID = /^https:\/\/steamcommunity\.com\/openid\/id\/(\d{17})$/

function loginFailed(message: string) {
  return htmlPage(
    'Steam sign-in failed',
    `<h1>Steam sign-in failed</h1><p>${message}</p><p>Go back to your MCP client and try connecting again.</p>`,
    400,
  )
}

// Steam redirects here after sign-in with an OpenID 2.0 assertion. We verify
// it with Steam, then hand an authorization code back to the MCP client.
export async function GET(req: Request) {
  const origin = getOrigin(req)
  const params = new URL(req.url).searchParams

  const login = params.get('login') ?? ''
  const claims = await verifyToken<LoginClaims>('login', login)
  if (!claims) return loginFailed('The sign-in link expired.')

  if (params.get('openid.mode') !== 'id_res') {
    return loginFailed('Sign-in was cancelled.')
  }
  if (
    params.get('openid.op_endpoint') !== STEAM_OPENID_ENDPOINT ||
    params.get('openid.return_to') !== `${origin}${BASE_PATH}/oauth/callback?login=${login}`
  ) {
    return loginFailed('Unexpected response from Steam.')
  }
  const steamid = params.get('openid.claimed_id')?.match(CLAIMED_ID)?.[1]
  if (!steamid || params.get('openid.identity') !== params.get('openid.claimed_id')) {
    return loginFailed('Unexpected response from Steam.')
  }

  const verification = new URLSearchParams()
  for (const [key, value] of params) {
    if (key.startsWith('openid.')) verification.set(key, value)
  }
  verification.set('openid.mode', 'check_authentication')
  const check = await fetch(STEAM_OPENID_ENDPOINT, {
    method: 'POST',
    body: verification,
    cache: 'no-store',
    signal: AbortSignal.timeout(10000),
  })
    .then((res) => res.text())
    .catch(() => '')
  if (!/^is_valid\s*:\s*true$/m.test(check)) {
    return loginFailed('Steam could not confirm your sign-in.')
  }

  const code = await signToken(
    'code',
    {
      sub: steamid,
      client_id: claims.client_id,
      redirect_uri: claims.redirect_uri,
      code_challenge: claims.code_challenge,
      scope: claims.scope,
    },
    AUTH_CODE_TTL,
  )

  const redirect = new URL(claims.redirect_uri)
  redirect.searchParams.set('code', code)
  if (claims.state) redirect.searchParams.set('state', claims.state)
  redirect.searchParams.set('iss', origin)
  return Response.redirect(redirect, 302)
}
