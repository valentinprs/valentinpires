import {
  isAllowedRedirectUri,
  json,
  oauthError,
  preflight,
  type ClientClaims,
} from '@/lib/steam-mcp/oauth'
import { deriveClientSecret, signToken } from '@/lib/steam-mcp/tokens'

// Dynamic Client Registration (RFC 7591). The client_id is a signed JWT
// carrying the registration, so nothing is stored server-side.
export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as {
    redirect_uris?: unknown
    client_name?: unknown
    token_endpoint_auth_method?: unknown
  } | null
  if (!body) return oauthError('invalid_client_metadata', 'Body must be JSON')

  const { redirect_uris } = body
  if (
    !Array.isArray(redirect_uris) ||
    redirect_uris.length === 0 ||
    redirect_uris.length > 10 ||
    !redirect_uris.every((u) => typeof u === 'string' && isAllowedRedirectUri(u))
  ) {
    return oauthError('invalid_redirect_uri', 'Invalid or missing redirect_uris')
  }

  const requestedMethod = body.token_endpoint_auth_method ?? 'none'
  if (
    requestedMethod !== 'none' &&
    requestedMethod !== 'client_secret_post' &&
    requestedMethod !== 'client_secret_basic'
  ) {
    return oauthError(
      'invalid_client_metadata',
      'Unsupported token_endpoint_auth_method',
    )
  }

  const claims: ClientClaims = {
    redirect_uris: redirect_uris as string[],
    auth_method: requestedMethod,
    ...(typeof body.client_name === 'string' && {
      client_name: body.client_name.slice(0, 100),
    }),
  }
  const clientId = await signToken('client', claims)

  return json(
    {
      client_id: clientId,
      client_id_issued_at: Math.floor(Date.now() / 1000),
      ...(claims.auth_method !== 'none' && {
        client_secret: deriveClientSecret(clientId),
        client_secret_expires_at: 0,
      }),
      client_name: claims.client_name,
      redirect_uris: claims.redirect_uris,
      token_endpoint_auth_method: claims.auth_method,
      grant_types: ['authorization_code', 'refresh_token'],
      response_types: ['code'],
    },
    201,
  )
}

export const OPTIONS = preflight
