import { BASE_PATH, SCOPE, getResourceUrl } from './config'
import { verifyToken } from './tokens'

// Steam only offers OpenID 2.0 sign-in, not OAuth. This server is therefore its
// own OAuth 2.1 authorization server (what MCP clients expect) and delegates
// the user login to Steam OpenID to learn the user's SteamID64.

export const STEAM_OPENID_ENDPOINT = 'https://steamcommunity.com/openid/login'

export type ClientClaims = {
  redirect_uris: string[]
  client_name?: string
  auth_method: 'none' | 'client_secret_post' | 'client_secret_basic'
}

export type ResolvedClient = ClientClaims & { client_id: string }

export const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  'Access-Control-Allow-Headers':
    'Authorization, Content-Type, Mcp-Protocol-Version, Mcp-Session-Id, Last-Event-ID',
  'Access-Control-Expose-Headers': 'WWW-Authenticate, Mcp-Session-Id',
  'Access-Control-Max-Age': '86400',
}

export function json(body: unknown, status = 200, headers: HeadersInit = {}) {
  return Response.json(body, {
    status,
    headers: { ...corsHeaders, 'Cache-Control': 'no-store', ...headers },
  })
}

export function oauthError(error: string, description: string, status = 400) {
  return json({ error, error_description: description }, status)
}

export function preflight() {
  return new Response(null, { status: 204, headers: corsHeaders })
}

export function protectedResourceMetadata(origin: string) {
  return {
    resource: getResourceUrl(origin),
    resource_name: 'Steam Achievements',
    authorization_servers: [origin],
    scopes_supported: [SCOPE],
    bearer_methods_supported: ['header'],
  }
}

export function authorizationServerMetadata(origin: string) {
  return {
    issuer: origin,
    authorization_endpoint: `${origin}${BASE_PATH}/oauth/authorize`,
    token_endpoint: `${origin}${BASE_PATH}/oauth/token`,
    registration_endpoint: `${origin}${BASE_PATH}/oauth/register`,
    scopes_supported: [SCOPE],
    response_types_supported: ['code'],
    response_modes_supported: ['query'],
    grant_types_supported: ['authorization_code', 'refresh_token'],
    code_challenge_methods_supported: ['S256'],
    token_endpoint_auth_methods_supported: [
      'none',
      'client_secret_post',
      'client_secret_basic',
    ],
    client_id_metadata_document_supported: true,
  }
}

export function isAllowedRedirectUri(uri: string): boolean {
  let url: URL
  try {
    url = new URL(uri)
  } catch {
    return false
  }
  if (url.hash) return false
  if (['javascript:', 'data:', 'file:', 'vbscript:'].includes(url.protocol)) {
    return false
  }
  if (url.protocol === 'http:') {
    // Plain http only for loopback redirects (native/CLI clients).
    return ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)
  }
  return true
}

/**
 * Resolves a client_id issued by /oauth/register (a signed JWT) or, per the
 * MCP spec's Client ID Metadata Documents, an https URL to the client's
 * metadata JSON.
 */
export async function resolveClient(
  clientId: string,
): Promise<ResolvedClient | null> {
  if (clientId.startsWith('https://')) return fetchClientMetadata(clientId)

  const claims = await verifyToken<ClientClaims>('client', clientId)
  if (!claims) return null
  return {
    client_id: clientId,
    redirect_uris: claims.redirect_uris,
    client_name: claims.client_name,
    auth_method: claims.auth_method,
  }
}

async function fetchClientMetadata(
  clientId: string,
): Promise<ResolvedClient | null> {
  const url = new URL(clientId)
  if (url.pathname === '/' || url.hash) return null
  try {
    const res = await fetch(url, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(5000),
      next: { revalidate: 3600 },
    })
    if (!res.ok) return null
    const text = await res.text()
    if (text.length > 10_000) return null
    const doc = JSON.parse(text) as {
      client_id?: string
      client_name?: string
      redirect_uris?: unknown
      token_endpoint_auth_method?: string
    }
    if (doc.client_id !== clientId) return null
    if (
      !Array.isArray(doc.redirect_uris) ||
      !doc.redirect_uris.every(
        (u) => typeof u === 'string' && isAllowedRedirectUri(u),
      )
    ) {
      return null
    }
    // No pre-shared secrets are possible with metadata documents.
    if ((doc.token_endpoint_auth_method ?? 'none') !== 'none') return null
    return {
      client_id: clientId,
      client_name: doc.client_name,
      redirect_uris: doc.redirect_uris,
      auth_method: 'none',
    }
  } catch {
    return null
  }
}

/** Minimal standalone HTML page for the consent and error screens. */
export function htmlPage(title: string, body: string, status = 200) {
  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)}</title>
<style>
  body{margin:0;min-height:100vh;display:grid;place-items:center;background:#0a0a0a;color:#f4f4f5;font:15px/1.5 system-ui,-apple-system,sans-serif}
  main{max-width:420px;padding:32px 24px}
  h1{font-size:20px;margin:0 0 12px}
  p{color:#a1a1aa;margin:0 0 16px}
  code{color:#e4e4e7;word-break:break-all}
  a.button{display:inline-block;margin-top:8px;padding:10px 18px;border-radius:8px;background:#f4f4f5;color:#0a0a0a;text-decoration:none;font-weight:600}
  a.button:hover{background:#d4d4d8}
</style></head>
<body><main>${body}</main></body></html>`
  return new Response(html, {
    status,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Frame-Options': 'DENY',
      'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'; frame-ancestors 'none'",
    },
  })
}

export function escapeHtml(value: string): string {
  return value.replace(
    /[&<>"']/g,
    (c) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[
        c
      ]!,
  )
}
