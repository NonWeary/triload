import type { StravaActivity } from "./strava"

export interface DailyLoad {
  date: string // YYYY-MM-DD
  ctl: number
  atl: number
  tsb: number
}

export function calculateTrainingLoad(activities: StravaActivity[]): DailyLoad[] {
  // Build a map of date -> total training load for that day
  const loadByDate = new Map<string, number>()

  for (const activity of activities) {
    const date = activity.start_date.slice(0, 10)
    const load =
      activity.suffer_score != null
        ? activity.suffer_score
        : (activity.moving_time / 3600) * 100

    loadByDate.set(date, (loadByDate.get(date) ?? 0) + load)
  }

  // Generate each date in the last 90 days in ascending order
  const today = new Date()
  const dates: string[] = []
  for (let i = 89; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    dates.push(d.toISOString().slice(0, 10))
  }

  // EWA multipliers
  const ctlAlpha = 1 / 42
  const atlAlpha = 1 / 7

  let ctl = 0
  let atl = 0
  const result: DailyLoad[] = []

  for (const date of dates) {
    const load = loadByDate.get(date) ?? 0

    ctl = ctl + (load - ctl) * ctlAlpha
    atl = atl + (load - atl) * atlAlpha

    result.push({
      date,
      ctl: Math.round(ctl * 10) / 10,
      atl: Math.round(atl * 10) / 10,
      tsb: Math.round((ctl - atl) * 10) / 10,
    })
  }

  return result
}
