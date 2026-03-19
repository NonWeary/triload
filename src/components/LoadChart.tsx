"use client"

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts"
import type { DailyLoad } from "@/lib/calculations"

interface Props {
  trainingLoad: DailyLoad[]
}

const tooltips = {
  CTL: "Chronic Training Load — your 42-day fitness average. Higher means more accumulated fitness.",
  ATL: "Acute Training Load — your 7-day fatigue average. High ATL means heavy recent training.",
  TSB: "Training Stress Balance (CTL − ATL). Positive = fresh, negative = fatigued.",
}

const legendItems = [
  { key: "CTL", label: "CTL — fitness", color: "#FC4C02", dash: false },
  { key: "ATL", label: "ATL — fatigue", color: "#7A6E5F", dash: true },
  { key: "TSB", label: "TSB — form", color: "#1E3A8A", dash: false },
]

function InsightCard({ tsb }: { tsb: number }) {
  let message: string
  let accentColor: string

  if (tsb > 10) {
    message = "You're fresh and race-ready. Good time to peak or race."
    accentColor = "#065F46"
  } else if (tsb >= 0) {
    message = "Good form. You're fit and not carrying too much fatigue."
    accentColor = "#1E3A8A"
  } else if (tsb >= -10) {
    message = "Moderate fatigue. You're in a build phase — expected."
    accentColor = "#92400E"
  } else {
    message = "High fatigue. Consider a recovery day or easy week."
    accentColor = "#991B1B"
  }

  return (
    <div
      className="mt-6 px-5 py-4 flex items-start gap-4"
      style={{
        backgroundColor: "#FDFAF5",
        borderTop: `2px solid ${accentColor}`,
        borderBottom: "1px solid #DDD5C4",
      }}
    >
      <p
        className="text-sm"
        style={{
          color: "#1A1208",
          fontFamily: "var(--font-playfair)",
          fontStyle: "italic",
          lineHeight: 1.65,
          letterSpacing: "0.01em",
        }}
      >
        {message}
      </p>
    </div>
  )
}

export default function LoadChart({ trainingLoad }: Props) {
  const latest = trainingLoad[trainingLoad.length - 1]

  const statCards = [
    { label: "CTL", sublabel: "Fitness", value: latest.ctl, color: "#FC4C02" },
    { label: "ATL", sublabel: "Fatigue", value: latest.atl, color: "#1A1208" },
    { label: "TSB", sublabel: "Form",    value: latest.tsb, color: "#1E3A8A" },
  ]

  return (
    <div>
      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-0 mb-6" style={{ border: "1px solid #DDD5C4" }}>
        {statCards.map(({ label, sublabel, value, color }, i) => (
          <div
            key={label}
            className="relative px-5 py-5"
            style={{
              backgroundColor: "#FDFAF5",
              borderTop: `3px solid ${color}`,
              borderRight: i < 2 ? "1px solid #DDD5C4" : undefined,
            }}
          >
            <div className="group absolute top-3 right-3">
              <span
                className="flex h-4 w-4 cursor-default items-center justify-center text-[10px]"
                style={{
                  border: "1px solid #DDD5C4",
                  color: "#7A6E5F",
                  fontFamily: "var(--font-dm-sans)",
                }}
              >
                i
              </span>
              <div
                className="pointer-events-none absolute right-0 top-6 z-10 w-56 px-3 py-2 text-xs leading-relaxed text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100"
                style={{ backgroundColor: "#1A1208", fontFamily: "var(--font-dm-sans)" }}
              >
                {tooltips[label as keyof typeof tooltips]}
              </div>
            </div>
            <p
              className="text-[10px] uppercase tracking-widest"
              style={{ color: "#7A6E5F", letterSpacing: "0.14em", fontFamily: "var(--font-dm-sans)" }}
            >
              {label} · {sublabel}
            </p>
            <p
              className="mt-2 text-4xl"
              style={{
                color,
                fontFamily: "var(--font-space-mono)",
                fontWeight: 700,
                letterSpacing: "-0.03em",
              }}
            >
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div
        className="px-5 pt-5 pb-2"
        style={{
          backgroundColor: "#FDFAF5",
          borderTop: "1px solid #DDD5C4",
          borderBottom: "1px solid #DDD5C4",
        }}
      >
        {/* Custom legend */}
        <div className="flex gap-6 mb-5">
          {legendItems.map(({ key, label, color, dash }) => (
            <div key={key} className="flex items-center gap-2">
              <svg width="20" height="10" style={{ flexShrink: 0 }}>
                {dash ? (
                  <line x1="0" y1="5" x2="20" y2="5" stroke={color} strokeWidth="1.5" strokeDasharray="4 3" />
                ) : (
                  <line x1="0" y1="5" x2="20" y2="5" stroke={color} strokeWidth="2" />
                )}
              </svg>
              <span
                className="text-xs"
                style={{ color: "#7A6E5F", fontFamily: "var(--font-dm-sans)", letterSpacing: "0.02em" }}
              >
                {label}
              </span>
            </div>
          ))}
        </div>

        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={trainingLoad} margin={{ top: 4, right: 16, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="2 4" stroke="#DDD5C4" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fill: "#7A6E5F", fontFamily: "var(--font-space-mono)" }}
              tickFormatter={(v) => v.slice(5)}
              interval={13}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              yAxisId="fitness"
              tick={{ fontSize: 10, fill: "#7A6E5F", fontFamily: "var(--font-space-mono)" }}
              axisLine={false}
              tickLine={false}
              width={28}
            />
            <YAxis
              yAxisId="form"
              orientation="right"
              tick={{ fontSize: 10, fill: "#7A6E5F", fontFamily: "var(--font-space-mono)" }}
              axisLine={false}
              tickLine={false}
              width={28}
              reversed={false}
              domain={["auto", "auto"]}
            />
            <Tooltip
              contentStyle={{
                fontSize: 11,
                border: "1px solid #DDD5C4",
                backgroundColor: "#FDFAF5",
                color: "#1A1208",
                fontFamily: "var(--font-space-mono)",
                borderRadius: 0,
              }}
              labelFormatter={(v) => v}
            />
            <Line yAxisId="fitness" type="monotone" dataKey="ctl" name="CTL" stroke="#FC4C02" dot={false} strokeWidth={2} />
            <Line yAxisId="fitness" type="monotone" dataKey="atl" name="ATL" stroke="#7A6E5F" dot={false} strokeWidth={1.5} strokeDasharray="4 3" />
            <Line yAxisId="form"    type="monotone" dataKey="tsb" name="TSB" stroke="#1E3A8A" dot={false} strokeWidth={1.5} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <InsightCard tsb={latest.tsb} />
    </div>
  )
}
