import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import {
  SteamApiError,
  getAchievementDetails,
  getOwnedGames,
  getPlayerAchievements,
  getPlayerSummary,
  getSteamLevel,
  mapWithConcurrency,
  type OwnedGame,
} from './steam-api'

const INSTRUCTIONS = `This server reads the signed-in user's Steam library and achievements (Steam profile and game details must be public).
Typical flow: call list_owned_games or get_achievement_overview to find games, then get_game_achievements with filter "locked" to see what is missing.
Descriptions of hidden achievements are included but can spoil the story: before revealing a locked hidden one, check that the user is fine with spoilers. Global unlock percentages tell how rare (and usually how hard) an achievement is. When the user asks for a 100% guide, combine the missing achievements with your own knowledge or web research, and flag missable achievements first.`

const PRIVATE_LIBRARY =
  'The Steam library is private. Ask the user to set "Game details" to Public in Steam > Profile > Edit Profile > Privacy Settings.'

const languageArg = z
  .string()
  .default('english')
  .describe(
    'Steam language for achievement names and descriptions, e.g. "english", "french", "german", "spanish".',
  )

type ToolResult = {
  content: { type: 'text'; text: string }[]
  isError?: boolean
}

function ok(data: unknown): ToolResult {
  return { content: [{ type: 'text', text: JSON.stringify(data) }] }
}

function fail(message: string): ToolResult {
  return { content: [{ type: 'text', text: message }], isError: true }
}

async function guard(fn: () => Promise<ToolResult>): Promise<ToolResult> {
  try {
    return await fn()
  } catch (error) {
    if (error instanceof SteamApiError) return fail(error.message)
    console.error('[steam-mcp] tool error', error)
    return fail('Unexpected error while talking to Steam.')
  }
}

const hours = (minutes: number) => Math.round((minutes / 60) * 10) / 10
const isoDate = (unix?: number) =>
  unix ? new Date(unix * 1000).toISOString().slice(0, 10) : undefined

const normalize = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()

function findGames(games: OwnedGame[], query: string): OwnedGame[] {
  const q = normalize(query)
  return games
    .filter((g) => normalize(g.name).includes(q))
    .sort((a, b) => {
      const exact = Number(normalize(b.name) === q) - Number(normalize(a.name) === q)
      return exact || b.playtime_forever - a.playtime_forever
    })
}

export function createSteamMcpServer(steamid: string): McpServer {
  const server = new McpServer(
    { name: 'steam-achievements', version: '1.0.0' },
    { instructions: INSTRUCTIONS },
  )

  // Owned games are needed by several tools; fetch them once per request.
  let ownedGames: Promise<OwnedGame[] | null> | undefined
  const loadGames = () => (ownedGames ??= getOwnedGames(steamid))

  server.registerTool(
    'get_steam_profile',
    {
      title: 'Steam profile',
      description:
        "Get the signed-in user's Steam profile: name, level, library size, total playtime and whether the profile is public.",
      annotations: { readOnlyHint: true, openWorldHint: true },
    },
    () =>
      guard(async () => {
        const [summary, level, games] = await Promise.all([
          getPlayerSummary(steamid),
          getSteamLevel(steamid).catch(() => null),
          loadGames(),
        ])
        if (!summary) return fail('Steam profile not found.')
        return ok({
          steamid,
          name: summary.personaname,
          profile_url: summary.profileurl,
          avatar: summary.avatarfull,
          level,
          profile_public: summary.communityvisibilitystate === 3,
          library_public: games !== null,
          member_since: isoDate(summary.timecreated),
          country: summary.loccountrycode,
          game_count: games?.length,
          games_with_achievements: games?.filter(
            (g) => g.has_community_visible_stats,
          ).length,
          total_playtime_hours: games
            ? hours(games.reduce((sum, g) => sum + g.playtime_forever, 0))
            : undefined,
          ...(games === null && { warning: PRIVATE_LIBRARY }),
        })
      }),
  )

  server.registerTool(
    'list_owned_games',
    {
      title: 'List owned games',
      description:
        "List or search games in the user's Steam library, with playtime and last played date. Use it to find a game's appid.",
      inputSchema: {
        query: z
          .string()
          .optional()
          .describe('Filter by (partial) game name.'),
        sort: z
          .enum(['playtime', 'recent', 'name'])
          .default('playtime')
          .describe('Sort order.'),
        only_with_achievements: z
          .boolean()
          .default(false)
          .describe('Only include games that have Steam achievements/stats.'),
        limit: z.number().int().min(1).max(500).default(50),
      },
      annotations: { readOnlyHint: true, openWorldHint: true },
    },
    ({ query, sort, only_with_achievements, limit }) =>
      guard(async () => {
        const games = await loadGames()
        if (games === null) return fail(PRIVATE_LIBRARY)

        let list = query ? findGames(games, query) : [...games]
        if (only_with_achievements) {
          list = list.filter((g) => g.has_community_visible_stats)
        }
        if (!query || sort !== 'playtime') {
          list.sort((a, b) =>
            sort === 'name'
              ? a.name.localeCompare(b.name)
              : sort === 'recent'
                ? (b.rtime_last_played ?? 0) - (a.rtime_last_played ?? 0)
                : b.playtime_forever - a.playtime_forever,
          )
        }
        return ok({
          total_matching: list.length,
          games: list.slice(0, limit).map((g) => ({
            appid: g.appid,
            name: g.name,
            playtime_hours: hours(g.playtime_forever),
            last_played: isoDate(g.rtime_last_played),
            has_achievements: Boolean(g.has_community_visible_stats),
          })),
        })
      }),
  )

  server.registerTool(
    'get_game_achievements',
    {
      title: 'Game achievements',
      description:
        "Get every achievement of one game with the user's unlock status, unlock date, description, hidden flag and global unlock rate. Locked achievements are sorted from most to least common (easiest first).",
      inputSchema: {
        game: z
          .union([z.number().int(), z.string()])
          .describe('Steam appid, or (part of) the game name from the library.'),
        filter: z
          .enum(['all', 'locked', 'unlocked'])
          .default('all')
          .describe('Which achievements to return.'),
        language: languageArg,
      },
      annotations: { readOnlyHint: true, openWorldHint: true },
    },
    ({ game, filter, language }) =>
      guard(async () => {
        let appid: number
        if (typeof game === 'number' || /^\d+$/.test(game)) {
          appid = Number(game)
        } else {
          const games = await loadGames()
          if (games === null) return fail(PRIVATE_LIBRARY)
          const matches = findGames(games, game)
          if (matches.length === 0) {
            return fail(`No game matching "${game}" in the user's library.`)
          }
          appid = matches[0].appid
        }

        const [player, details] = await Promise.all([
          getPlayerAchievements(steamid, appid, language),
          getAchievementDetails(appid, language),
        ])
        if (!player.ok) {
          return fail(
            /not public/i.test(player.error)
              ? PRIVATE_LIBRARY
              : `Steam: ${player.error} (appid ${appid}).`,
          )
        }

        const achievements = player.achievements.map((a) => {
          const meta = details.get(a.apiname)
          // Kept compact: big games have hundreds of achievements.
          return {
            name: a.name ?? meta?.name ?? a.apiname,
            description: a.description || meta?.description || undefined,
            hidden: meta?.hidden || undefined,
            unlocked: a.achieved === 1,
            unlocked_on: a.achieved ? isoDate(a.unlocktime) : undefined,
            global_unlock_percent:
              meta?.globalPercent !== undefined
                ? Math.round(meta.globalPercent * 10) / 10
                : undefined,
          }
        })
        const unlocked = achievements.filter((a) => a.unlocked).length
        const filtered = achievements
          .filter((a) =>
            filter === 'all' ? true : filter === 'unlocked' ? a.unlocked : !a.unlocked,
          )
          .sort((a, b) =>
            a.unlocked !== b.unlocked
              ? Number(a.unlocked) - Number(b.unlocked)
              : a.unlocked
                ? (b.unlocked_on ?? '').localeCompare(a.unlocked_on ?? '')
                : (b.global_unlock_percent ?? -1) - (a.global_unlock_percent ?? -1),
          )

        return ok({
          appid,
          game: player.gameName,
          unlocked,
          total: achievements.length,
          completion_percent: achievements.length
            ? Math.round((unlocked / achievements.length) * 1000) / 10
            : 0,
          achievements: filtered,
        })
      }),
  )

  server.registerTool(
    'get_achievement_overview',
    {
      title: 'Achievement overview',
      description:
        'Achievement completion across many games of the library (unlocked/total per game), to find perfect games and the games closest to 100%. Checks games with achievements, by playtime or recency.',
      inputSchema: {
        sort: z
          .enum(['playtime', 'recent'])
          .default('playtime')
          .describe('Which games to check first.'),
        limit: z
          .number()
          .int()
          .min(1)
          .max(100)
          .default(30)
          .describe('How many games to check (each one is a Steam API call).'),
      },
      annotations: { readOnlyHint: true, openWorldHint: true },
    },
    ({ sort, limit }) =>
      guard(async () => {
        const games = await loadGames()
        if (games === null) return fail(PRIVATE_LIBRARY)

        const candidates = games
          .filter((g) => g.has_community_visible_stats && g.playtime_forever > 0)
          .sort((a, b) =>
            sort === 'recent'
              ? (b.rtime_last_played ?? 0) - (a.rtime_last_played ?? 0)
              : b.playtime_forever - a.playtime_forever,
          )
          .slice(0, limit)

        const rows = await mapWithConcurrency(candidates, 6, async (g) => {
          const res = await getPlayerAchievements(steamid, g.appid, 'english').catch(
            () => null,
          )
          if (!res?.ok || res.achievements.length === 0) return null
          const unlocked = res.achievements.filter((a) => a.achieved).length
          const total = res.achievements.length
          return {
            appid: g.appid,
            name: g.name,
            unlocked,
            total,
            missing: total - unlocked,
            completion_percent: Math.round((unlocked / total) * 1000) / 10,
            playtime_hours: hours(g.playtime_forever),
          }
        })
        const withAchievements = rows.filter((r) => r !== null)
        withAchievements.sort(
          (a, b) => b.completion_percent - a.completion_percent || a.missing - b.missing,
        )

        return ok({
          games_checked: candidates.length,
          perfect_games: withAchievements.filter((r) => r.missing === 0).length,
          average_completion_percent: withAchievements.length
            ? Math.round(
                (withAchievements.reduce((s, r) => s + r.completion_percent, 0) /
                  withAchievements.length) *
                  10,
              ) / 10
            : 0,
          games: withAchievements,
        })
      }),
  )

  server.registerPrompt(
    'completion_guide',
    {
      title: '100% completion guide',
      description:
        'Build a step-by-step guide to 100% a game from the achievements still missing.',
      argsSchema: {
        game: z.string().describe('Game name or Steam appid.'),
        language: z
          .string()
          .optional()
          .describe('Language for the guide and achievement names, e.g. "french".'),
      },
    },
    ({ game, language }) => ({
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `Help me get 100% of the achievements in "${game}".
1. Call get_game_achievements with game="${game}", filter="locked"${language ? ` and language="${language}"` : ''}.
2. Group the missing achievements (story, collectibles, missables, difficulty, grind, multiplayer/co-op, DLC) and flag anything missable or tied to a single playthrough choice first.
3. Propose an efficient order to unlock them, with concrete steps for each achievement. Use web search if available to check details, and say when something is uncertain.
4. Estimate the remaining effort, using the global unlock rates as a hint of difficulty.${language ? `\nWrite the guide in ${language}.` : ''}`,
          },
        },
      ],
    }),
  )

  return server
}
