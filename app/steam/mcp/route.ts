import { WebStandardStreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js'
import { BASE_PATH, SCOPE, getOrigin, getResourceUrl } from '@/lib/steam-mcp/config'
import { corsHeaders, preflight } from '@/lib/steam-mcp/oauth'
import { createSteamMcpServer } from '@/lib/steam-mcp/server'
import { verifyToken } from '@/lib/steam-mcp/tokens'

export const maxDuration = 60

function unauthorized(req: Request, description: string) {
  const metadata = `${getOrigin(req)}/.well-known/oauth-protected-resource${BASE_PATH}/mcp`
  return Response.json(
    { error: 'invalid_token', error_description: description },
    {
      status: 401,
      headers: {
        ...corsHeaders,
        'WWW-Authenticate': `Bearer error="invalid_token", error_description="${description}", resource_metadata="${metadata}", scope="${SCOPE}"`,
      },
    },
  )
}

export async function POST(req: Request) {
  const token = req.headers.get('authorization')?.match(/^Bearer (.+)$/i)?.[1]
  if (!token) return unauthorized(req, 'Missing access token')

  const claims = await verifyToken<{ sub: string; aud: string; client_id: string }>(
    'access',
    token,
  )
  if (!claims || claims.aud !== getResourceUrl(getOrigin(req))) {
    return unauthorized(req, 'Invalid or expired access token')
  }

  // Stateless: a fresh server and transport per request, no session storage.
  const server = createSteamMcpServer(claims.sub)
  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true,
  })
  await server.connect(transport)
  const res = await transport.handleRequest(req, {
    authInfo: {
      token,
      clientId: claims.client_id,
      scopes: [SCOPE],
      extra: { steamid: claims.sub },
    },
  })
  const headers = new Headers(res.headers)
  for (const [k, v] of Object.entries(corsHeaders)) headers.set(k, v)
  return new Response(res.body, { status: res.status, headers })
}

// No server-initiated streams or sessions in stateless mode.
function methodNotAllowed() {
  return Response.json(
    { jsonrpc: '2.0', error: { code: -32000, message: 'Method not allowed.' }, id: null },
    { status: 405, headers: { ...corsHeaders, Allow: 'POST, OPTIONS' } },
  )
}

export const GET = methodNotAllowed
export const DELETE = methodNotAllowed
export const OPTIONS = preflight
