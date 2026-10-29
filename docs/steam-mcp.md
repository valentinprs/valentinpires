# Steam Achievements MCP

Remote MCP server served at `https://valentinpires.vercel.app/steam/mcp`. Users sign in through Steam and an AI assistant can then read their library and achievements.

## How it works

- Routes live in `app/steam/`. `next.config.mjs` only rewrites the root `/.well-known` OAuth discovery URLs to it.
- Steam has no OAuth, only OpenID 2.0 sign-in. The server is its own OAuth 2.1 authorization server (what MCP clients expect) and uses Steam OpenID to learn the user's SteamID64.
- No database: registered clients, codes and tokens are signed JWTs (`lib/steam-mcp/tokens.ts`). Access tokens last 24h, refresh tokens 180 days. Changing `STEAM_MCP_SECRET` signs everyone out.
- Data comes from the Steam Web API with the server's key (`lib/steam-mcp/steam-api.ts`), so only public profiles with public game details work.

| Path | Purpose |
| --- | --- |
| `/steam/mcp` | MCP endpoint (Streamable HTTP, stateless, Bearer token) |
| `/.well-known/oauth-protected-resource/steam/mcp` | Protected resource metadata |
| `/.well-known/oauth-authorization-server` | Authorization server metadata |
| `/steam/oauth/register` | Dynamic client registration |
| `/steam/oauth/authorize` | Consent screen, then redirect to Steam sign-in |
| `/steam/oauth/callback` | Steam OpenID return, verifies the assertion |
| `/steam/oauth/token` | Code and refresh token exchange (PKCE S256) |

Tools: `get_steam_profile`, `list_owned_games`, `get_game_achievements`, `get_achievement_overview`. Prompt: `completion_guide`.

## Environment variables

- `STEAM_API_KEY`: Steam Web API key from https://steamcommunity.com/dev/apikey
- `STEAM_MCP_SECRET`: random string of at least 32 characters (`openssl rand -base64 48`)
- `STEAM_MCP_ORIGIN` (optional): public origin, e.g. `https://valentinpires.vercel.app`. Defaults to the request host.

## Deployment

Set the environment variables in Vercel (Project → Settings → Environment Variables) and redeploy. No extra domain is needed.

## Local development

Run `npm run dev` with the variables in `.env.local`, then use `http://localhost:3000/steam/mcp` (for example with `npx @modelcontextprotocol/inspector`).
