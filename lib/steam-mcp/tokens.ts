import { createHash, createHmac, timingSafeEqual } from 'crypto'
import { SignJWT, jwtVerify, type JWTPayload } from 'jose'
import { getSigningSecret } from './config'

// Every piece of OAuth state (registered clients, pending logins, codes and
// tokens) is a signed JWT, so the server needs no database. The `pur` claim
// keeps one kind of token from being replayed as another.
type Purpose = 'client' | 'login' | 'code' | 'access' | 'refresh'

export async function signToken(
  purpose: Purpose,
  claims: JWTPayload,
  ttlSeconds?: number,
): Promise<string> {
  const jwt = new SignJWT({ ...claims, pur: purpose })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
  if (ttlSeconds) jwt.setExpirationTime(`${ttlSeconds}s`)
  return jwt.sign(getSigningSecret())
}

export async function verifyToken<T extends JWTPayload>(
  purpose: Purpose,
  token: string,
): Promise<T | null> {
  try {
    const { payload } = await jwtVerify(token, getSigningSecret(), {
      algorithms: ['HS256'],
    })
    return payload.pur === purpose ? (payload as T) : null
  } catch {
    return null
  }
}

// Confidential clients get a secret derived from their client_id, so it can be
// checked later without storing it.
export function deriveClientSecret(clientId: string): string {
  return createHmac('sha256', getSigningSecret())
    .update(`client-secret:${clientId}`)
    .digest('base64url')
}

export function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a)
  const bb = Buffer.from(b)
  return ab.length === bb.length && timingSafeEqual(ab, bb)
}

export function pkceChallenge(verifier: string): string {
  return createHash('sha256').update(verifier).digest('base64url')
}
