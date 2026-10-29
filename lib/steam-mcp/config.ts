// Shared configuration for the Steam achievements MCP server, served under
// /steam (app/steam). Only the /.well-known metadata is rewritten, in next.config.mjs.

export const BASE_PATH = '/steam'

export const SCOPE = 'steam:achievements:read'

export const ACCESS_TOKEN_TTL = 60 * 60 * 24 // 24 hours
export const REFRESH_TOKEN_TTL = 60 * 60 * 24 * 180 // 180 days
export const AUTH_CODE_TTL = 60 * 5 // 5 minutes
export const LOGIN_STATE_TTL = 60 * 15 // 15 minutes

export function getSteamApiKey(): string {
  const key = process.env.STEAM_API_KEY
  if (!key) throw new Error('STEAM_API_KEY is not set')
  return key
}

export function getSigningSecret(): Uint8Array {
  const secret = process.env.STEAM_MCP_SECRET
  if (!secret || secret.length < 32) {
    throw new Error('STEAM_MCP_SECRET must be set to at least 32 characters')
  }
  return new TextEncoder().encode(secret)
}

/**
 * Public origin of the MCP server, e.g. https://valentinpires.vercel.app.
 * Prefers STEAM_MCP_ORIGIN; falls back to the request's forwarded host so that
 * local development on http://localhost:3000 works out of the box.
 */
export function getOrigin(req: Request): string {
  const configured = process.env.STEAM_MCP_ORIGIN
  if (configured) return configured.replace(/\/$/, '')

  const host =
    req.headers.get('x-forwarded-host') ??
    req.headers.get('host') ??
    new URL(req.url).host
  const isLocal = /^(localhost|127\.0\.0\.1|\[::1\]|[^/]+\.localhost)(:\d+)?$/.test(
    host,
  )
  const proto =
    req.headers.get('x-forwarded-proto')?.split(',')[0] ??
    (isLocal ? 'http' : 'https')
  return `${proto}://${host}`
}

export function getResourceUrl(origin: string): string {
  return `${origin}${BASE_PATH}/mcp`
}
