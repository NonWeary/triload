"use client"

import type { StravaActivity } from "@/lib/strava"

interface Props {
  activities: StravaActivity[]
  units: "metric" | "imperial"
}

type Sport = "Run" | "Ride" | "Swim" | "Other"

function getSport(a: StravaActivity): Sport {
  const t = (a.sport_type || a.type || "").toLowerCase()
  if (t.includes("run")) return "Run"
  if (t.includes("ride") || t.includes("cycling") || t.includes("bike")) return "Ride"
  if (t.includes("swim")) return "Swim"
  return "Other"
}

const SPORT_COLOR: Record<Sport, string> = {
  Run:   "#FC4C02",
  Ride:  "#2563eb",
  Swim:  "#16a34a",
  Other: "#7A6E5F",
}

function formatDistance(a: StravaActivity, sport: Sport, units: "metric" | "imperial"): string {
  if (sport === "Swim") {
    if (units === "imperial") return `${Math.round(a.distance * 1.09361).toLocaleString()} yd`
    return `${Math.round(a.distance).toLocaleString()} m`
  }
  if (units === "imperial") return `${(a.distance / 1000 * 0.621371).toFixed(1)} mi`
  return `${(a.distance / 1000).toFixed(1)} km`
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (h > 0) return `${h}h ${m}m`
  return `${m}m`
}

function formatPace(a: StravaActivity, sport: Sport, units: "metric" | "imperial"): string {
  if (a.distance === 0 || a.moving_time === 0) return ""
  if (sport === "Run") {
    const distUnit = units === "imperial" ? a.distance / 1000 * 0.621371 : a.distance / 1000
    const minsPerUnit = a.moving_time / 60 / distUnit
    const mins = Math.floor(minsPerUnit)
    const secs = Math.round((minsPerUnit - mins) * 60)
    const label = units === "imperial" ? "/mi" : "/km"
    return `${mins}:${secs.toString().padStart(2, "0")}${label}`
  }
  if (sport === "Ride") {
    const speed = (a.distance / 1000) / (a.moving_time / 3600)
    if (units === "imperial") return `${(speed * 0.621371).toFixed(1)} mph`
    return `${speed.toFixed(1)} km/h`
  }
  if (sport === "Swim") {
    const baseDist = units === "imperial" ? a.distance * 1.09361 / 100 : a.distance / 100
    const baseLabel = units === "imperial" ? "/100yd" : "/100m"
    const minsPer = a.moving_time / 60 / baseDist
    const mins = Math.floor(minsPer)
    const secs = Math.round((minsPer - mins) * 60)
    return `${mins}:${secs.toString().padStart(2, "0")}${baseLabel}`
  }
  return ""
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-GB", { day: "numeric", month: "short" })
}

export default function ActivityList({ activities, units }: Props) {
  const recent = [...activities]
    .sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime())
    .slice(0, 20)

  return (
    <div
      style={{
        backgroundColor: "#FDFAF5",
        borderTop: "1px solid #DDD5C4",
        borderBottom: "1px solid #DDD5C4",
      }}
    >
      {recent.map((activity, i) => {
        const sport = getSport(activity)
        const color = SPORT_COLOR[sport]
        const pace = formatPace(activity, sport, units)

        return (
          <div
            key={activity.id}
            className="flex items-center gap-4 px-5 py-4"
            style={{
              borderLeft: `3px solid ${color}`,
              borderBottom: i < recent.length - 1 ? "1px solid #DDD5C4" : undefined,
              backgroundColor: i % 2 === 0 ? "#FDFAF5" : "rgba(221,213,196,0.12)",
            }}
          >
            {/* Name + date */}
            <div className="flex-1 min-w-0">
              <p
                className="truncate"
                style={{
                  fontFamily: "var(--font-playfair)",
                  fontStyle: "italic",
                  fontSize: 15,
                  color: "#1A1208",
                  fontWeight: 400,
                  lineHeight: 1.3,
                }}
              >
                {activity.name}
              </p>
              <p className="mt-0.5" style={{ fontSize: 11, color: "#7A6E5F", fontFamily: "var(--font-dm-sans)" }}>
                <span
                  style={{
                    fontSize: 9,
                    textTransform: "uppercase",
                    letterSpacing: "0.12em",
                    fontWeight: 600,
                    color,
                  }}
                >
                  {sport}
                </span>
                {" · "}
                {formatDate(activity.start_date)}
              </p>
            </div>

            {/* Distance + duration */}
            <div className="text-right flex-shrink-0">
              <p
                style={{
                  fontFamily: "var(--font-space-mono)",
                  fontSize: 13,
                  fontWeight: 700,
                  color: "#1A1208",
                  letterSpacing: "-0.02em",
                }}
              >
                {formatDistance(activity, sport, units)}
              </p>
              <p style={{ fontSize: 11, color: "#7A6E5F", marginTop: 2, fontFamily: "var(--font-dm-sans)" }}>
                {formatDuration(activity.moving_time)}
                {pace ? ` · ${pace}` : ""}
              </p>
            </div>
          </div>
        )
      })}

      {recent.length === 0 && (
        <p
          className="px-5 py-10 text-sm text-center"
          style={{ color: "#7A6E5F", fontFamily: "var(--font-playfair)", fontStyle: "italic" }}
        >
          No activities found.
        </p>
      )}
    </div>
  )
}
