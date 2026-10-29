import {
  ACCESS_TOKEN_TTL,
  REFRESH_TOKEN_TTL,
  SCOPE,
  getOrigin,
  getResourceUrl,
} from '@/lib/steam-mcp/config'
import { json, oauthError, preflight, resolveClient } from '@/lib/steam-mcp/oauth'
import {
  deriveClientSecret,
  pkceChallenge,
  safeEqual,
  signToken,
  verifyToken,
} from '@/lib/steam-mcp/tokens'

type CodeClaims = {
  sub: string
  client_id: string
  redirect_uri: string
  code_challenge: string
}

type RefreshClaims = { sub: string; client_id: string }

export async function POST(req: Request) {
  const form = new URLSearchParams(await req.text())

  // Client credentials may come in the Basic header or in the body.
  let clientId = form.get('client_id')
  let clientSecret = form.get('client_secret')
  const basic = req.headers.get('authorization')?.match(/^Basic (.+)$/i)?.[1]
  if (basic) {
    const [id, secret] = Buffer.from(basic, 'base64').toString().split(':')
    clientId = decodeURIComponent(id)
    clientSecret = decodeURIComponent(secret ?? '')
  }
  if (!clientId) return oauthError('invalid_client', 'Missing client_id', 401)

  const client = await resolveClient(clientId)
  if (!client) return oauthError('invalid_client', 'Unknown client', 401)
  if (
    client.auth_method !== 'none' &&
    !(clientSecret && safeEqual(clientSecret, deriveClientSecret(clientId)))
  ) {
    return oauthError('invalid_client', 'Invalid client credentials', 401)
  }

  let steamid: string
  const grantType = form.get('grant_type')
  if (grantType === 'authorization_code') {
    const code = await verifyToken<CodeClaims>('code', form.get('code') ?? '')
    if (!code || code.client_id !== clientId) {
      return oauthError('invalid_grant', 'Invalid or expired code')
    }
    if (form.get('redirect_uri') !== code.redirect_uri) {
      return oauthError('invalid_grant', 'redirect_uri mismatch')
    }
    const verifier = form.get('code_verifier')
    if (!verifier || !safeEqual(pkceChallenge(verifier), code.code_challenge)) {
      return oauthError('invalid_grant', 'Invalid code_verifier')
    }
    steamid = code.sub
  } else if (grantType === 'refresh_token') {
    const refresh = await verifyToken<RefreshClaims>(
      'refresh',
      form.get('refresh_token') ?? '',
    )
    if (!refresh || refresh.client_id !== clientId) {
      return oauthError('invalid_grant', 'Invalid or expired refresh token')
    }
    steamid = refresh.sub
  } else {
    return oauthError('unsupported_grant_type', 'Unsupported grant_type')
  }

  const audience = getResourceUrl(getOrigin(req))
  const [accessToken, refreshToken] = await Promise.all([
    signToken(
      'access',
      { sub: steamid, aud: audience, client_id: clientId, scope: SCOPE },
      ACCESS_TOKEN_TTL,
    ),
    signToken('refresh', { sub: steamid, client_id: clientId }, REFRESH_TOKEN_TTL),
  ])

  return json({
    access_token: accessToken,
    token_type: 'Bearer',
    expires_in: ACCESS_TOKEN_TTL,
    refresh_token: refreshToken,
    scope: SCOPE,
  })
}

export const OPTIONS = preflight
