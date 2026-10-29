import { getOrigin } from '@/lib/steam-mcp/config'
import { json, preflight, protectedResourceMetadata } from '@/lib/steam-mcp/oauth'

export function GET(req: Request) {
  return json(protectedResourceMetadata(getOrigin(req)))
}

export const OPTIONS = preflight
