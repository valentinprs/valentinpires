import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import {
  SteamApiError,
  getAchievementDetails,
  getOwnedGames,
  getPlayerAchievements,
  getPlayerSummary,
  getSteamLevel,
  getStoreAppDetails,
  mapWithConcurrency,
  queryGuides,
  searchStore,
  type OwnedGame,
} from './steam-api'

const INSTRUCTIONS = `This server reads the signed-in user's Steam library and achievements (Steam profile and game details must be public).
Typical flow: call list_owned_games, get_achievement_overview or get_recent_unlocks to find games, then get_game_achievements with filter "locked" (or find_quick_wins) to see what is missing.
For a 100% guide, also use get_game_details (DLCs, multiplayer features) and search_achievement_guides (community guides to open and rely on). get_game_achievement_list works for games the user does not own.
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

const roundPercent = (p?: number) =>
  p === undefined || Number.isNaN(p) ? undefined : Math.round(p * 10) / 10

function rarity(percent?: number): string {
  if (percent === undefined) return 'unknown'
  if (percent >= 50) return 'common'
  if (percent >= 20) return 'uncommon'
  if (percent >= 5) return 'rare'
  return 'very rare'
}

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

  const gameArg = z
    .union([z.number().int(), z.string()])
    .describe('Steam appid, or (part of) the game name.')

  // Resolves an appid or a name in the user's library, then, when `store` is
  // set, on the Steam Store for games the user does not own.
  async function resolveGame(
    game: number | string,
    store = false,
  ): Promise<{ appid: number } | { error: string }> {
    if (typeof game === 'number' || /^\d+$/.test(game)) {
      return { appid: Number(game) }
    }
    const games = await loadGames()
    const owned = games ? findGames(games, game) : []
    if (owned.length) return { appid: owned[0].appid }
    if (store) {
      const results = await searchStore(game)
      const q = normalize(game)
      const match = results.find((r) => normalize(r.name) === q) ?? results[0]
      return match
        ? { appid: match.appid }
        : { error: `No game matching "${game}" on the Steam Store.` }
    }
    if (games === null) return { error: PRIVATE_LIBRARY }
    return { error: `No game matching "${game}" in the user's library.` }
  }

  // The user's achievements for one game, merged with names, descriptions
  // (hidden ones included) and global unlock rates.
  type GameAchievement = {
    name: string
    description?: string
    hidden?: true
    unlocked: boolean
    unlocked_on?: string
    global_unlock_percent?: number
  }

  async function loadGameAchievements(
    appid: number,
    language: string,
  ): Promise<{ gameName: string; achievements: GameAchievement[] } | { error: string }> {
    const [player, details] = await Promise.all([
      getPlayerAchievements(steamid, appid, language),
      getAchievementDetails(appid, language),
    ])
    if (!player.ok) {
      return {
        error: /not public/i.test(player.error)
          ? PRIVATE_LIBRARY
          : `Steam: ${player.error} (appid ${appid}).`,
      }
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
        global_unlock_percent: roundPercent(meta?.globalPercent),
      }
    })
    return { gameName: player.gameName, achievements }
  }

  server.registerTool(
    'get_game_achievements',
    {
      title: 'Game achievements',
      description:
        "Get every achievement of one game with the user's unlock status, unlock date, description, hidden flag and global unlock rate. Locked achievements are sorted from most to least common (easiest first).",
      inputSchema: {
        game: gameArg,
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
        const resolved = await resolveGame(game)
        if ('error' in resolved) return fail(resolved.error)
        const { appid } = resolved

        const result = await loadGameAchievements(appid, language)
        if ('error' in result) return fail(result.error)
        const { achievements } = result

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
          game: result.gameName,
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
    'find_quick_wins',
    {
      title: 'Quick wins',
      description:
        "The easiest achievements the user is still missing in one game, ranked by global unlock rate, with a rarity label and a breakdown of what is left by rarity.",
      inputSchema: {
        game: gameArg,
        limit: z.number().int().min(1).max(50).default(10),
        language: languageArg,
      },
      annotations: { readOnlyHint: true, openWorldHint: true },
    },
    ({ game, limit, language }) =>
      guard(async () => {
        const resolved = await resolveGame(game)
        if ('error' in resolved) return fail(resolved.error)

        const result = await loadGameAchievements(resolved.appid, language)
        if ('error' in result) return fail(result.error)

        const locked = result.achievements
          .filter((a) => !a.unlocked)
          .map(({ name, description, hidden, global_unlock_percent }) => ({
            name,
            description,
            hidden,
            global_unlock_percent,
            rarity: rarity(global_unlock_percent),
          }))
          .sort((a, b) => (b.global_unlock_percent ?? -1) - (a.global_unlock_percent ?? -1))

        const remainingByRarity: Record<string, number> = {}
        for (const a of locked) {
          remainingByRarity[a.rarity] = (remainingByRarity[a.rarity] ?? 0) + 1
        }
        return ok({
          appid: resolved.appid,
          game: result.gameName,
          missing: locked.length,
          remaining_by_rarity: remainingByRarity,
          quick_wins: locked.slice(0, limit),
        })
      }),
  )

  server.registerTool(
    'get_game_achievement_list',
    {
      title: 'Achievement list of any game',
      description:
        "All achievements of any Steam game, owned or not, with descriptions (hidden ones included), global unlock rates and rarity. Use it to judge how hard a 100% is before buying or starting a game.",
      inputSchema: {
        game: gameArg,
        language: languageArg,
      },
      annotations: { readOnlyHint: true, openWorldHint: true },
    },
    ({ game, language }) =>
      guard(async () => {
        const resolved = await resolveGame(game, true)
        if ('error' in resolved) return fail(resolved.error)
        const { appid } = resolved

        const [details, store, games] = await Promise.all([
          getAchievementDetails(appid, language),
          getStoreAppDetails(appid, language, 'US', 'basic').catch(() => null),
          loadGames(),
        ])
        if (details.size === 0) {
          return fail(`No achievements found for appid ${appid}.`)
        }
        const achievements = [...details.values()]
          .map((a) => {
            const percent = roundPercent(a.globalPercent)
            return {
              name: a.name,
              description: a.description,
              hidden: a.hidden || undefined,
              global_unlock_percent: percent,
              rarity: rarity(percent),
            }
          })
          .sort((a, b) => (b.global_unlock_percent ?? -1) - (a.global_unlock_percent ?? -1))

        const byRarity: Record<string, number> = {}
        for (const a of achievements) byRarity[a.rarity] = (byRarity[a.rarity] ?? 0) + 1
        return ok({
          appid,
          game: store?.name,
          owned: games?.some((g) => g.appid === appid) ?? undefined,
          total: achievements.length,
          by_rarity: byRarity,
          rarest_unlock_percent: achievements.at(-1)?.global_unlock_percent,
          achievements,
        })
      }),
  )

  server.registerTool(
    'get_game_details',
    {
      title: 'Game details',
      description:
        'Steam Store details of a game: description, developers, release date, price, genres, features (single-player, co-op, online multiplayer...), number of achievements and its DLCs. Useful to spot achievements that need a DLC or other players.',
      inputSchema: {
        game: gameArg,
        language: languageArg,
        country: z
          .string()
          .length(2)
          .default('US')
          .describe('Two-letter country code used for the price, e.g. "FR".'),
      },
      annotations: { readOnlyHint: true, openWorldHint: true },
    },
    ({ game, language, country }) =>
      guard(async () => {
        const resolved = await resolveGame(game, true)
        if ('error' in resolved) return fail(resolved.error)
        const { appid } = resolved

        const [app, games] = await Promise.all([
          getStoreAppDetails(appid, language, country),
          loadGames(),
        ])
        if (!app) return fail(`No Steam Store page for appid ${appid}.`)

        const dlcIds = app.dlc ?? []
        const dlcs = await mapWithConcurrency(dlcIds.slice(0, 10), 4, async (id) => {
          const dlc = await getStoreAppDetails(id, language, country, 'basic').catch(
            () => null,
          )
          return { appid: id, name: dlc?.name, type: dlc?.type }
        })

        return ok({
          appid,
          name: app.name,
          type: app.type,
          owned: games?.some((g) => g.appid === appid) ?? undefined,
          store_url: `https://store.steampowered.com/app/${appid}`,
          short_description: app.short_description,
          developers: app.developers,
          publishers: app.publishers,
          release_date: app.release_date?.date,
          coming_soon: app.release_date?.coming_soon || undefined,
          price: app.is_free ? 'Free' : app.price_overview?.final_formatted,
          discount_percent: app.price_overview?.discount_percent || undefined,
          genres: app.genres?.map((g) => g.description),
          features: app.categories?.map((c) => c.description),
          platforms: app.platforms
            ? Object.keys(app.platforms).filter((p) => app.platforms![p])
            : undefined,
          controller_support: app.controller_support,
          metacritic: app.metacritic?.score,
          achievements_total: app.achievements?.total ?? 0,
          dlc_total: dlcIds.length,
          dlc: dlcs,
        })
      }),
  )

  server.registerTool(
    'search_achievement_guides',
    {
      title: 'Search achievement guides',
      description:
        'Search Steam Community guides for a game, ranked by votes, with their link. Open the most relevant ones (with a web fetch tool, if available) to build an accurate 100% guide.',
      inputSchema: {
        game: gameArg,
        query: z
          .string()
          .min(1)
          .default('achievement')
          .describe(
            'Search text, e.g. "achievement", "100%", "missable", or an achievement name.',
          ),
        limit: z.number().int().min(1).max(30).default(10),
      },
      annotations: { readOnlyHint: true, openWorldHint: true },
    },
    ({ game, query, limit }) =>
      guard(async () => {
        const resolved = await resolveGame(game, true)
        if ('error' in resolved) return fail(resolved.error)
        const { appid } = resolved

        const { total, guides } = await queryGuides(appid, query, limit)
        return ok({
          appid,
          query,
          total_matching: total,
          guides: guides.map((g) => ({
            title: g.title,
            description: g.short_description || undefined,
            url: `https://steamcommunity.com/sharedfiles/filedetails/?id=${g.publishedfileid}`,
            rating_percent: g.vote_data
              ? Math.round(g.vote_data.score * 100)
              : undefined,
            votes_up: g.vote_data?.votes_up,
            views: g.views,
            updated_on: isoDate(g.time_updated),
          })),
        })
      }),
  )

  server.registerTool(
    'get_recent_unlocks',
    {
      title: 'Recent unlocks',
      description:
        "The user's most recently unlocked achievements across the games they played last, newest first.",
      inputSchema: {
        limit: z.number().int().min(1).max(100).default(20),
        games_to_scan: z
          .number()
          .int()
          .min(1)
          .max(40)
          .default(15)
          .describe('How many recently played games to check (one Steam call each).'),
        language: languageArg,
      },
      annotations: { readOnlyHint: true, openWorldHint: true },
    },
    ({ limit, games_to_scan, language }) =>
      guard(async () => {
        const games = await loadGames()
        if (games === null) return fail(PRIVATE_LIBRARY)

        const candidates = games
          .filter((g) => g.has_community_visible_stats && g.rtime_last_played)
          .sort((a, b) => (b.rtime_last_played ?? 0) - (a.rtime_last_played ?? 0))
          .slice(0, games_to_scan)

        const perGame = await mapWithConcurrency(candidates, 6, async (g) => {
          const [res, details] = await Promise.all([
            getPlayerAchievements(steamid, g.appid, language).catch(() => null),
            getAchievementDetails(g.appid, language).catch(() => null),
          ])
          if (!res?.ok) return []
          return res.achievements
            .filter((a) => a.achieved && a.unlocktime)
            .map((a) => ({
              game: g.name,
              appid: g.appid,
              name: a.name ?? a.apiname,
              description:
                a.description || details?.get(a.apiname)?.description || undefined,
              unlocktime: a.unlocktime,
            }))
        })

        const unlocks = perGame
          .flat()
          .sort((a, b) => b.unlocktime - a.unlocktime)
          .slice(0, limit)
          .map(({ unlocktime, ...a }) => ({
            ...a,
            unlocked_at: new Date(unlocktime * 1000).toISOString(),
          }))
        return ok({ games_checked: candidates.length, unlocks })
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
