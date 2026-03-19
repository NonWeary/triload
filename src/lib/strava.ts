export interface StravaActivity {
  id: number
  name: string
  type: string
  sport_type: string
  start_date: string
  moving_time: number
  distance: number
  suffer_score: number | null
}

export async function getActivities(accessToken: string): Promise<StravaActivity[]> {
  const after = Math.floor((Date.now() - 90 * 24 * 60 * 60 * 1000) / 1000)

  const url = new URL("https://www.strava.com/api/v3/athlete/activities")
  url.searchParams.set("per_page", "200")
  url.searchParams.set("after", String(after))

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  if (!res.ok) {
    throw new Error(`Strava API error: ${res.status} ${res.statusText}`)
  }

  return res.json()
}
