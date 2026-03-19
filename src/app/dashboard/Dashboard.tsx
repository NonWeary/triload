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
  const [showMethodology, setShowMethodology] = useState(false)

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
            <div className="flex items-center gap-3">
            {activeView === "load" && (
              <button
                onClick={() => setShowMethodology(true)}
                className="flex items-center gap-1.5 text-xs"
                style={{
                  border: "1px solid #DDD5C4",
                  backgroundColor: "#FDFAF5",
                  color: "#7A6E5F",
                  fontFamily: "var(--font-dm-sans)",
                  padding: "6px 10px",
                }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                How it works
              </button>
            )}
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

      {/* Methodology drawer */}
      {showMethodology && (
        <div
          className="fixed inset-0 z-50 flex justify-end"
          onClick={() => setShowMethodology(false)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0" style={{ backgroundColor: "rgba(26,18,8,0.3)" }} />

          {/* Panel */}
          <div
            className="relative h-full overflow-y-auto"
            style={{
              width: "min(480px, 90vw)",
              backgroundColor: "#FDFAF5",
              borderLeft: "1px solid #DDD5C4",
              padding: "40px 36px",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close */}
            <button
              onClick={() => setShowMethodology(false)}
              className="absolute top-5 right-5"
              style={{ color: "#7A6E5F" }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            <h2
              style={{
                fontFamily: "var(--font-playfair)",
                fontStyle: "italic",
                fontSize: 24,
                fontWeight: 400,
                color: "#1A1208",
                marginBottom: 8,
                letterSpacing: "-0.01em",
              }}
            >
              How it's calculated
            </h2>
            <div style={{ height: 1, backgroundColor: "#DDD5C4", marginBottom: 28 }} />

            {/* Training load */}
            <section style={{ marginBottom: 28 }}>
              <h3 style={{ fontFamily: "var(--font-dm-sans)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.14em", color: "#7A6E5F", marginBottom: 8 }}>
                Training load per activity
              </h3>
              <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: 14, color: "#1A1208", lineHeight: 1.7 }}>
                Each activity uses Strava's <strong>suffer score</strong> if available. If not, load is estimated as:
              </p>
              <div
                style={{
                  margin: "12px 0",
                  padding: "10px 14px",
                  backgroundColor: "#F4EFE6",
                  borderLeft: "2px solid #DDD5C4",
                  fontFamily: "var(--font-space-mono)",
                  fontSize: 12,
                  color: "#1A1208",
                }}
              >
                (moving time in hours) × 100
              </div>
              <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: 14, color: "#7A6E5F", lineHeight: 1.7 }}>
                All activity loads on the same day are summed together.
              </p>
            </section>

            {/* CTL */}
            <section style={{ marginBottom: 28 }}>
              <h3 style={{ fontFamily: "var(--font-dm-sans)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.14em", color: "#FC4C02", marginBottom: 8 }}>
                CTL — Chronic Training Load (fitness)
              </h3>
              <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: 14, color: "#1A1208", lineHeight: 1.7 }}>
                A 42-day exponentially weighted average. Updated each day as:
              </p>
              <div
                style={{
                  margin: "12px 0",
                  padding: "10px 14px",
                  backgroundColor: "#F4EFE6",
                  borderLeft: "2px solid #FC4C02",
                  fontFamily: "var(--font-space-mono)",
                  fontSize: 12,
                  color: "#1A1208",
                }}
              >
                CTL = CTL + (load − CTL) × (1/42)
              </div>
              <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: 14, color: "#7A6E5F", lineHeight: 1.7 }}>
                Slow to build, slow to decay. Represents your long-term fitness base.
              </p>
            </section>

            {/* ATL */}
            <section style={{ marginBottom: 28 }}>
              <h3 style={{ fontFamily: "var(--font-dm-sans)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.14em", color: "#1A1208", marginBottom: 8 }}>
                ATL — Acute Training Load (fatigue)
              </h3>
              <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: 14, color: "#1A1208", lineHeight: 1.7 }}>
                A 7-day exponentially weighted average. Same formula with a faster time constant:
              </p>
              <div
                style={{
                  margin: "12px 0",
                  padding: "10px 14px",
                  backgroundColor: "#F4EFE6",
                  borderLeft: "2px solid #1A1208",
                  fontFamily: "var(--font-space-mono)",
                  fontSize: 12,
                  color: "#1A1208",
                }}
              >
                ATL = ATL + (load − ATL) × (1/7)
              </div>
              <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: 14, color: "#7A6E5F", lineHeight: 1.7 }}>
                Reacts quickly to recent training. Spikes after hard weeks, drops fast during rest.
              </p>
            </section>

            {/* TSB */}
            <section style={{ marginBottom: 28 }}>
              <h3 style={{ fontFamily: "var(--font-dm-sans)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.14em", color: "#1E3A8A", marginBottom: 8 }}>
                TSB — Training Stress Balance (form)
              </h3>
              <div
                style={{
                  margin: "12px 0",
                  padding: "10px 14px",
                  backgroundColor: "#F4EFE6",
                  borderLeft: "2px solid #1E3A8A",
                  fontFamily: "var(--font-space-mono)",
                  fontSize: 12,
                  color: "#1A1208",
                }}
              >
                TSB = CTL − ATL
              </div>
              <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: 14, color: "#1A1208", lineHeight: 1.7 }}>
                Positive means fresh — more fitness than fatigue. Negative means fatigued. The sweet spot for racing is typically <strong>0 to +15</strong>: fit but recovered.
              </p>
            </section>

            {/* Reading the chart */}
            <section>
              <h3 style={{ fontFamily: "var(--font-dm-sans)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.14em", color: "#7A6E5F", marginBottom: 12 }}>
                Reading the chart
              </h3>
              {[
                { label: "CTL rising + ATL spiking", desc: "Hard training block in progress." },
                { label: "CTL high + ATL dropping", desc: "Taper underway — form is building." },
                { label: "TSB deeply negative", desc: "Overreach risk. Consider easy days." },
                { label: "TSB very positive", desc: "Well rested, possibly detrained." },
              ].map(({ label, desc }) => (
                <div key={label} style={{ marginBottom: 10 }}>
                  <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: 13, color: "#1A1208", fontWeight: 500, marginBottom: 2 }}>{label}</p>
                  <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: 13, color: "#7A6E5F", lineHeight: 1.6 }}>{desc}</p>
                </div>
              ))}
            </section>
          </div>
        </div>
      )}
    </div>
  )
}
