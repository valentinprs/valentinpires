import { getSteamApiKey } from './config'

const API = 'https://api.steampowered.com'

export class SteamApiError extends Error {
  constructor(
    message: string,
    public status?: number,
  ) {
    super(message)
  }
}

type FetchOptions = { revalidate?: number }

async function steamGet<T>(
  path: string,
  params: Record<string, string | number>,
  { revalidate }: FetchOptions = {},
): Promise<T> {
  const url = new URL(`${API}/${path}`)
  url.searchParams.set('key', getSteamApiKey())
  url.searchParams.set('format', 'json')
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, String(v))

  const res = await fetch(url, {
    signal: AbortSignal.timeout(15000),
    ...(revalidate ? { next: { revalidate } } : { cache: 'no-store' }),
  })
  const body = (await res.json().catch(() => null)) as T | null
  if (!body) {
    throw new SteamApiError(
      res.status === 429
        ? 'Steam API rate limit reached, try again in a moment.'
        : `Steam API request failed (${res.status}).`,
      res.status,
    )
  }
  // Some endpoints (GetPlayerAchievements) return an error body with 400/403.
  if (!res.ok && !hasPlayerStats(body)) {
    throw new SteamApiError(`Steam API request failed (${res.status}).`, res.status)
  }
  return body
}

function hasPlayerStats(body: unknown): boolean {
  return typeof body === 'object' && body !== null && 'playerstats' in body
}

export type PlayerSummary = {
  steamid: string
  personaname: string
  profileurl: string
  avatarfull: string
  communityvisibilitystate: number // 3 = public
  timecreated?: number
  loccountrycode?: string
}

export async function getPlayerSummary(
  steamid: string,
): Promise<PlayerSummary | null> {
  const data = await steamGet<{ response: { players: PlayerSummary[] } }>(
    'ISteamUser/GetPlayerSummaries/v2/',
    { steamids: steamid },
    { revalidate: 300 },
  )
  return data.response.players[0] ?? null
}

export async function getSteamLevel(steamid: string): Promise<number | null> {
  const data = await steamGet<{ response: { player_level?: number } }>(
    'IPlayerService/GetSteamLevel/v1/',
    { steamid },
    { revalidate: 300 },
  )
  return data.response.player_level ?? null
}

export type OwnedGame = {
  appid: number
  name: string
  playtime_forever: number // minutes
  rtime_last_played?: number
  has_community_visible_stats?: boolean
}

/** Returns null when the user's game details are private. */
export async function getOwnedGames(
  steamid: string,
): Promise<OwnedGame[] | null> {
  const data = await steamGet<{
    response: { game_count?: number; games?: OwnedGame[] }
  }>(
    'IPlayerService/GetOwnedGames/v1/',
    { steamid, include_appinfo: 1, include_played_free_games: 1 },
    { revalidate: 300 },
  )
  if (data.response.game_count === undefined) return null
  return data.response.games ?? []
}

export type PlayerAchievement = {
  apiname: string
  achieved: number
  unlocktime: number
  name?: string
  description?: string
}

export type PlayerAchievementsResult =
  | { ok: true; gameName: string; achievements: PlayerAchievement[] }
  | { ok: false; error: string }

export async function getPlayerAchievements(
  steamid: string,
  appid: number,
  language: string,
): Promise<PlayerAchievementsResult> {
  const data = await steamGet<{
    playerstats: {
      success: boolean
      error?: string
      gameName?: string
      achievements?: PlayerAchievement[]
    }
  }>(
    'ISteamUserStats/GetPlayerAchievements/v1/',
    { steamid, appid, l: language },
    { revalidate: 60 },
  )
  const stats = data.playerstats
  if (!stats.success) {
    return { ok: false, error: stats.error ?? 'Unknown Steam error' }
  }
  return {
    ok: true,
    gameName: stats.gameName ?? `App ${appid}`,
    achievements: stats.achievements ?? [],
  }
}

export type SchemaAchievement = {
  name: string
  displayName: string
  description?: string
  hidden: number
  icon: string
  icongray: string
}

export async function getAchievementSchema(
  appid: number,
  language: string,
): Promise<SchemaAchievement[]> {
  const data = await steamGet<{
    game?: { availableGameStats?: { achievements?: SchemaAchievement[] } }
  }>(
    'ISteamUserStats/GetSchemaForGame/v2/',
    { appid, l: language },
    { revalidate: 60 * 60 * 24 },
  )
  return data.game?.availableGameStats?.achievements ?? []
}

export async function getGlobalAchievementPercentages(
  appid: number,
): Promise<Map<string, number>> {
  const data = await steamGet<{
    achievementpercentages?: {
      achievements?: { name: string; percent: number | string }[]
    }
  }>(
    'ISteamUserStats/GetGlobalAchievementPercentagesForApp/v2/',
    { gameid: appid },
    { revalidate: 60 * 60 * 6 },
  ).catch(() => null)
  const list = data?.achievementpercentages?.achievements ?? []
  return new Map(list.map((a) => [a.name, Number(a.percent)]))
}

export type AchievementDetails = {
  name: string
  description?: string
  hidden: boolean
  globalPercent?: number
}

/**
 * Name, description, hidden flag and global unlock rate of every achievement
 * of a game, keyed by API name. IPlayerService/GetGameAchievements (used by the
 * Steam client) includes descriptions of hidden achievements, which the
 * public schema leaves out. It is undocumented, so fall back to the schema and
 * global percentages when it fails.
 */
export async function getAchievementDetails(
  appid: number,
  language: string,
): Promise<Map<string, AchievementDetails>> {
  const data = await steamGet<{
    response?: {
      achievements?: {
        internal_name: string
        localized_name: string
        localized_desc?: string
        hidden: boolean
        player_percent_unlocked?: string
      }[]
    }
  }>(
    'IPlayerService/GetGameAchievements/v1/',
    { appid, language },
    { revalidate: 60 * 60 * 6 },
  ).catch(() => null)

  const list = data?.response?.achievements
  if (list?.length) {
    return new Map(
      list.map((a) => [
        a.internal_name,
        {
          name: a.localized_name,
          description: a.localized_desc || undefined,
          hidden: a.hidden,
          globalPercent:
            a.player_percent_unlocked !== undefined
              ? Number(a.player_percent_unlocked)
              : undefined,
        },
      ]),
    )
  }

  const [schema, percents] = await Promise.all([
    getAchievementSchema(appid, language).catch(() => []),
    getGlobalAchievementPercentages(appid),
  ])
  return new Map(
    schema.map((a) => [
      a.name,
      {
        name: a.displayName,
        description: a.description || undefined,
        hidden: a.hidden === 1,
        globalPercent: percents.get(a.name),
      },
    ]),
  )
}

export async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length)
  let next = 0
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (next < items.length) {
      const i = next++
      results[i] = await fn(items[i])
    }
  })
  await Promise.all(workers)
  return results
}
