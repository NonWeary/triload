"use client"

import { useState } from "react"
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

const SPORT_COLORS: Record<Sport, string> = {
  Run: "#FC4C02",
  Ride: "#2563eb",
  Swim: "#16a34a",
  Other: "#7A6E5F",
}

function getWeekStart(dateStr: string): string {
  const d = new Date(dateStr)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d.toISOString().slice(0, 10)
}

function getLast8WeekStarts(): string[] {
  const today = new Date()
  const day = today.getDay()
  const diff = day === 0 ? -6 : 1 - day
  const thisMonday = new Date(today)
  thisMonday.setDate(today.getDate() + diff)
  thisMonday.setHours(0, 0, 0, 0)

  return Array.from({ length: 8 }, (_, i) => {
    const d = new Date(thisMonday)
    d.setDate(thisMonday.getDate() - (7 - i) * 7)
    return d.toISOString().slice(0, 10)
  })
}

function formatWeekLabel(weekStart: string): string {
  return new Date(weekStart + "T12:00:00").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })
}

function formatHours(seconds: number): string {
  return (seconds / 3600).toFixed(1) + "h"
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (h > 0) return `${h}h ${m}m`
  return `${m}m`
}

function calcTSS(a: StravaActivity): number {
  return a.suffer_score != null ? a.suffer_score : (a.moving_time / 3600) * 100
}

export default function WeeklySummary({ activities, units }: Props) {
  const [hoveredWeek, setHoveredWeek] = useState<string | null>(null)
  const now = new Date()

  const thisWeekStart = getWeekStart(now.toISOString())
  const thisWeekActivities = activities.filter(
    (a) => getWeekStart(a.start_date) === thisWeekStart
  )
  const thisWeekSeconds = thisWeekActivities.reduce((s, a) => s + a.moving_time, 0)
  const thisWeekTSS = Math.round(thisWeekActivities.reduce((s, a) => s + calcTSS(a), 0))

  const weekStarts = getLast8WeekStarts()
  const last4Starts = weekStarts.slice(-4)
  const last4Seconds = last4Starts.map((ws) =>
    activities.filter((a) => getWeekStart(a.start_date) === ws).reduce((s, a) => s + a.moving_time, 0)
  )
  const avg4WeekHours = ((last4Seconds.reduce((s, v) => s + v, 0) / 4) / 3600).toFixed(1)

  const weeklyData = weekStarts.map((ws) => {
    const wActs = activities.filter((a) => getWeekStart(a.start_date) === ws)
    const byHours: Record<Sport, number> = { Run: 0, Ride: 0, Swim: 0, Other: 0 }
    for (const a of wActs) {
      byHours[getSport(a)] += a.moving_time / 3600
    }
    const total = Object.values(byHours).reduce((s, v) => s + v, 0)
    return { weekStart: ws, byHours, total }
  })
  const maxHours = Math.max(...weeklyData.map((w) => w.total), 0.1)

  const thirtyDaysAgo = new Date(now)
  thirtyDaysAgo.setDate(now.getDate() - 30)
  const last30 = activities.filter((a) => new Date(a.start_date) >= thirtyDaysAgo)

  const sportSummary = (["Run", "Ride", "Swim"] as Sport[]).map((sport) => {
    const acts = last30.filter((a) => getSport(a) === sport)
    const totalM = acts.reduce((s, a) => s + a.distance, 0)
    const totalSec = acts.reduce((s, a) => s + a.moving_time, 0)
    const isSwim = sport === "Swim"
    let distLabel: string
    if (isSwim) {
      distLabel = units === "imperial"
        ? `${Math.round(totalM * 1.09361).toLocaleString()} yd`
        : `${Math.round(totalM).toLocaleString()} m`
    } else {
      distLabel = units === "imperial"
        ? `${(totalM / 1000 * 0.621371).toFixed(0)} mi`
        : `${(totalM / 1000).toFixed(0)} km`
    }
    return { sport, distLabel, timeLabel: formatDuration(totalSec), count: acts.length }
  })

  const statCardStyle = {
    backgroundColor: "#FDFAF5",
    borderBottom: "1px solid #DDD5C4",
  }

  return (
    <div className="space-y-6">
      {/* Top stat cards */}
      <div
        className="grid grid-cols-3"
        style={{ border: "1px solid #DDD5C4" }}
      >
        {[
          { label: "This week", value: formatHours(thisWeekSeconds), sub: "hours" },
          { label: "4-week avg", value: `${avg4WeekHours}h`, sub: "hrs / week" },
          { label: "TSS", value: String(thisWeekTSS), sub: "training stress" },
        ].map(({ label, value, sub }, i) => (
          <div
            key={label}
            className="px-5 py-5"
            style={{
              ...statCardStyle,
              borderRight: i < 2 ? "1px solid #DDD5C4" : undefined,
              borderTop: "3px solid #1A1208",
            }}
          >
            <p
              className="text-[10px] uppercase tracking-widest"
              style={{ color: "#7A6E5F", letterSpacing: "0.14em", fontFamily: "var(--font-dm-sans)" }}
            >
              {label}
            </p>
            <p
              className="mt-2 text-4xl"
              style={{
                color: "#1A1208",
                fontFamily: "var(--font-space-mono)",
                fontWeight: 700,
                letterSpacing: "-0.03em",
              }}
            >
              {value}
            </p>
            <p className="mt-0.5 text-xs" style={{ color: "#7A6E5F", fontFamily: "var(--font-dm-sans)" }}>{sub}</p>
          </div>
        ))}
      </div>

      {/* Weekly bars */}
      <div
        style={{
          backgroundColor: "#FDFAF5",
          borderTop: "1px solid #DDD5C4",
          borderBottom: "1px solid #DDD5C4",
        }}
      >
        <div
          className="px-5 py-3"
          style={{ borderBottom: "1px solid #DDD5C4" }}
        >
          <p
            className="text-xs uppercase tracking-widest"
            style={{ color: "#7A6E5F", letterSpacing: "0.14em", fontFamily: "var(--font-dm-sans)" }}
          >
            Last 8 weeks
          </p>
        </div>
        <div className="px-5 py-4 space-y-3">
          {weeklyData.map(({ weekStart, byHours, total }) => {
            const isHovered = hoveredWeek === weekStart
            const activeSports = (["Run", "Ride", "Swim", "Other"] as Sport[]).filter(
              (s) => byHours[s] > 0
            )

            return (
              <div
                key={weekStart}
                className="relative flex items-center gap-3"
                onMouseEnter={() => setHoveredWeek(weekStart)}
                onMouseLeave={() => setHoveredWeek(null)}
              >
                <span
                  className="w-14 flex-shrink-0"
                  style={{
                    fontSize: 10,
                    color: "#7A6E5F",
                    fontFamily: "var(--font-space-mono)",
                    letterSpacing: "0.02em",
                  }}
                >
                  {formatWeekLabel(weekStart)}
                </span>
                <div className="flex-1">
                  <div
                    className="flex gap-[3px] items-center"
                    style={{ width: `${(total / maxHours) * 100}%`, minWidth: total > 0 ? 6 : 0 }}
                  >
                    {activeSports.map((sport) => (
                      <div
                        key={sport}
                        style={{
                          height: 10,
                          flex: byHours[sport],
                          backgroundColor: SPORT_COLORS[sport],
                          borderRadius: 1,
                        }}
                      />
                    ))}
                  </div>
                </div>
                <span
                  className="w-10 text-right flex-shrink-0"
                  style={{
                    fontSize: 10,
                    color: "#7A6E5F",
                    fontFamily: "var(--font-space-mono)",
                  }}
                >
                  {total > 0 ? `${total.toFixed(1)}h` : "—"}
                </span>

                {/* Tooltip */}
                {isHovered && total > 0 && (
                  <div
                    className="absolute left-16 bottom-full mb-2 z-10 px-3 py-2 shadow-lg pointer-events-none"
                    style={{ backgroundColor: "rgba(26,18,8,0.88)" }}
                  >
                    <div className="flex items-center gap-4">
                      {activeSports.map((sport) => (
                        <div key={sport} className="flex items-center gap-1.5">
                          <div style={{ width: 6, height: 6, backgroundColor: SPORT_COLORS[sport], flexShrink: 0, borderRadius: 1 }} />
                          <span style={{ fontSize: 10, color: "#DDD5C4", fontFamily: "var(--font-dm-sans)" }}>{sport}</span>
                          <span style={{ fontSize: 10, color: "#F4EFE6", fontFamily: "var(--font-space-mono)", fontWeight: 700 }}>
                            {formatDuration(Math.round(byHours[sport] * 3600))}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Legend */}
        <div className="px-5 pb-4 flex gap-5" style={{ borderTop: "1px solid #DDD5C4", paddingTop: 12 }}>
          {(["Run", "Ride", "Swim", "Other"] as Sport[]).map((s) => (
            <div key={s} className="flex items-center gap-1.5">
              <div style={{ width: 8, height: 8, backgroundColor: SPORT_COLORS[s], borderRadius: 1 }} />
              <span style={{ fontSize: 10, color: "#7A6E5F", fontFamily: "var(--font-dm-sans)", letterSpacing: "0.04em" }}>{s}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 30-day sport summaries */}
      <div
        className="grid grid-cols-3"
        style={{ border: "1px solid #DDD5C4" }}
      >
        {sportSummary.map(({ sport, distLabel, timeLabel, count }, i) => (
          <div
            key={sport}
            className="px-5 py-5"
            style={{
              backgroundColor: "#FDFAF5",
              borderTop: `3px solid ${SPORT_COLORS[sport]}`,
              borderRight: i < 2 ? "1px solid #DDD5C4" : undefined,
            }}
          >
            <p
              className="text-[10px] uppercase tracking-widest mb-2"
              style={{ color: SPORT_COLORS[sport], letterSpacing: "0.14em", fontFamily: "var(--font-dm-sans)", fontWeight: 600 }}
            >
              {sport}
            </p>
            <p
              style={{
                fontFamily: "var(--font-space-mono)",
                fontSize: 20,
                fontWeight: 700,
                color: "#1A1208",
                letterSpacing: "-0.02em",
              }}
            >
              {count > 0 ? distLabel : "—"}
            </p>
            <p style={{ fontSize: 11, color: "#7A6E5F", marginTop: 2, fontFamily: "var(--font-dm-sans)" }}>
              {count > 0 ? timeLabel : "No activities"} · last 30 days
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
