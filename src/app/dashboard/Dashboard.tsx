"use client"

import { useEffect, useState } from "react"
import Sidebar, { type View } from "@/components/Sidebar"
import LoadChart from "@/components/LoadChart"
import ActivityList from "@/components/ActivityList"
import WeeklySummary from "@/components/WeeklySummary"
import type { DailyLoad } from "@/lib/calculations"
import type { StravaActivity } from "@/lib/strava"

interface Props {
  name: string
}

const VIEW_TITLES: Record<View, string> = {
  load: "Training load",
  activities: "Activities",
  weekly: "Weekly summary",
}

const UNIT_VIEWS: View[] = ["activities", "weekly"]

export default function Dashboard({ name }: Props) {
  const [activeView, setActiveView] = useState<View>("load")
  const [activities, setActivities] = useState<StravaActivity[] | null>(null)
  const [trainingLoad, setTrainingLoad] = useState<DailyLoad[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [units, setUnits] = useState<"metric" | "imperial">("metric")

  const initials = name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()

  useEffect(() => {
    const stored = localStorage.getItem("triload-units")
    if (stored === "imperial") setUnits("imperial")
  }, [])

  useEffect(() => {
    fetch("/api/strava/activities")
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({}))
          throw new Error(body.error ?? `Request failed: ${res.status}`)
        }
        return res.json()
      })
      .then((data) => {
        setActivities(data.activities)
        setTrainingLoad(data.trainingLoad)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  function toggleUnits() {
    const next = units === "metric" ? "imperial" : "metric"
    setUnits(next)
    localStorage.setItem("triload-units", next)
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F4EFE6" }}>
      <Sidebar activeView={activeView} onViewChange={setActiveView} initials={initials} />

      {/* Main content */}
      <div className="sm:ml-48 pb-16 sm:pb-0">
        <div className="mx-auto max-w-3xl px-6 py-8">

          {/* Header row */}
          <div className="flex items-end justify-between mb-8">
            <div>
              <p
                className="text-[10px] uppercase tracking-widest mb-1"
                style={{ color: "#7A6E5F", letterSpacing: "0.16em" }}
              >
                {activeView === "load" ? "Performance" : activeView === "activities" ? "Log" : "Overview"}
              </p>
              <h1
                style={{
                  fontFamily: "var(--font-playfair)",
                  fontStyle: "italic",
                  fontSize: 32,
                  fontWeight: 400,
                  color: "#1A1208",
                  lineHeight: 1.1,
                  letterSpacing: "-0.02em",
                }}
              >
                {VIEW_TITLES[activeView]}
              </h1>
            </div>
            {UNIT_VIEWS.includes(activeView) && (
              <button
                onClick={toggleUnits}
                className="flex items-center text-xs overflow-hidden"
                style={{
                  border: "1px solid #DDD5C4",
                  backgroundColor: "#FDFAF5",
                  fontFamily: "var(--font-space-mono)",
                  fontSize: 11,
                }}
              >
                <span
                  className="px-3 py-1.5 transition-colors"
                  style={{
                    backgroundColor: units === "metric" ? "#1A1208" : "transparent",
                    color: units === "metric" ? "#F4EFE6" : "#7A6E5F",
                  }}
                >
                  km
                </span>
                <span
                  className="px-3 py-1.5 transition-colors"
                  style={{
                    backgroundColor: units === "imperial" ? "#1A1208" : "transparent",
                    color: units === "imperial" ? "#F4EFE6" : "#7A6E5F",
                  }}
                >
                  mi
                </span>
              </button>
            )}
          </div>

          {/* Ruled separator */}
          <div style={{ height: 1, backgroundColor: "#DDD5C4", marginBottom: 28 }} />

          {loading && (
            <p
              className="text-sm"
              style={{ color: "#7A6E5F", fontFamily: "var(--font-space-mono)", fontSize: 12 }}
            >
              Loading activities…
            </p>
          )}

          {error && (
            <p className="text-sm" style={{ color: "#dc2626" }}>Failed to load data: {error}</p>
          )}

          {!loading && !error && activities && trainingLoad && (
            <>
              {activeView === "load"       && <LoadChart trainingLoad={trainingLoad} />}
              {activeView === "activities" && <ActivityList activities={activities} units={units} />}
              {activeView === "weekly"     && <WeeklySummary activities={activities} units={units} />}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
