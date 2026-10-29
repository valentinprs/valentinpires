import { getOrigin } from '@/lib/steam-mcp/config'
import { authorizationServerMetadata, json, preflight } from '@/lib/steam-mcp/oauth'

export function GET(req: Request) {
  return json(authorizationServerMetadata(getOrigin(req)))
}

export const OPTIONS = preflight
