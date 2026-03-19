"use client"

import React from "react"
import { signOut } from "next-auth/react"

export type View = "load" | "activities" | "weekly"

interface Props {
  activeView: View
  onViewChange: (view: View) => void
  initials: string
}

const navItems: { view: View; label: string; icon: React.ReactNode }[] = [
  {
    view: "load",
    label: "Training load",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 flex-shrink-0">
        <polyline points="2,12 6,12 8,5 10,19 12,12 14,15 16,12 22,12" />
      </svg>
    ),
  },
  {
    view: "activities",
    label: "Activities",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 flex-shrink-0">
        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
        <rect x="9" y="3" width="6" height="4" rx="1" />
        <line x1="9" y1="12" x2="15" y2="12" />
        <line x1="9" y1="16" x2="13" y2="16" />
      </svg>
    ),
  },
  {
    view: "weekly",
    label: "Weekly summary",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 flex-shrink-0">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
]

export default function Sidebar({ activeView, onViewChange, initials }: Props) {
  return (
    <>
      {/* Desktop sidebar */}
      <nav
        className="hidden sm:flex flex-col fixed left-0 top-0 h-full z-20 py-4"
        style={{
          width: 192,
          backgroundColor: "#0F0D0A",
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-5 mb-6 select-none">
          <span
            style={{
              fontFamily: "var(--font-playfair)",
              fontStyle: "italic",
              fontSize: 17,
              fontWeight: 400,
              color: "#FC4C02",
              letterSpacing: "-0.02em",
              lineHeight: 1,
            }}
          >
            TL
          </span>
          <span
            style={{
              fontFamily: "var(--font-playfair)",
              fontStyle: "italic",
              fontSize: 15,
              fontWeight: 400,
              color: "rgba(255,255,255,0.75)",
              letterSpacing: "-0.01em",
              lineHeight: 1,
            }}
          >
            Triload
          </span>
        </div>

        {/* Divider */}
        <div style={{ height: 1, backgroundColor: "rgba(255,255,255,0.07)", marginBottom: 10, marginLeft: 20, marginRight: 20 }} />

        {/* Nav items */}
        <div className="flex flex-col gap-0.5 px-2">
          {navItems.map(({ view, label, icon }) => {
            const active = activeView === view
            return (
              <button
                key={view}
                onClick={() => onViewChange(view)}
                className="flex items-center gap-3 w-full px-3 py-2.5 text-left transition-colors"
                style={{
                  backgroundColor: active ? "rgba(252,76,2,0.15)" : "transparent",
                  color: active ? "#FC4C02" : "rgba(255,255,255,0.4)",
                  borderLeft: active ? "2px solid #FC4C02" : "2px solid transparent",
                }}
              >
                {icon}
                <span
                  style={{
                    fontSize: 12,
                    fontFamily: "var(--font-dm-sans)",
                    fontWeight: active ? 500 : 400,
                    letterSpacing: "0.01em",
                    color: active ? "#FC4C02" : "rgba(255,255,255,0.5)",
                  }}
                >
                  {label}
                </span>
              </button>
            )
          })}
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Divider */}
        <div style={{ height: 1, backgroundColor: "rgba(255,255,255,0.07)", marginBottom: 12, marginLeft: 20, marginRight: 20 }} />

        {/* Sign out */}
        <div className="px-2">
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex items-center gap-3 w-full px-3 py-2.5 transition-opacity hover:opacity-75"
          >
            <div
              className="flex items-center justify-center flex-shrink-0 text-white text-[10px] font-bold"
              style={{
                width: 22,
                height: 22,
                backgroundColor: "#FC4C02",
                fontFamily: "var(--font-dm-sans)",
              }}
            >
              {initials}
            </div>
            <span
              style={{
                fontSize: 12,
                fontFamily: "var(--font-dm-sans)",
                color: "rgba(255,255,255,0.4)",
                letterSpacing: "0.01em",
              }}
            >
              Sign out
            </span>
          </button>
        </div>
      </nav>

      {/* Mobile bottom nav */}
      <nav
        className="sm:hidden fixed bottom-0 left-0 right-0 h-14 z-20 flex items-center justify-around px-4"
        style={{ backgroundColor: "#0F0D0A" }}
      >
        {navItems.map(({ view, label, icon }) => {
          const active = activeView === view
          return (
            <button
              key={view}
              onClick={() => onViewChange(view)}
              className="flex flex-col items-center gap-0.5"
              style={{ color: active ? "#FC4C02" : "rgba(255,255,255,0.4)" }}
              aria-label={label}
            >
              {icon}
              <span className="text-[10px]" style={{ fontFamily: "var(--font-dm-sans)" }}>
                {label.split(" ")[0]}
              </span>
            </button>
          )
        })}
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex flex-col items-center gap-0.5"
          style={{ color: "rgba(255,255,255,0.4)" }}
          aria-label="Sign out"
        >
          <div
            className="flex items-center justify-center w-5 h-5 text-white text-[9px] font-bold"
            style={{ backgroundColor: "#FC4C02" }}
          >
            {initials}
          </div>
          <span className="text-[10px]" style={{ fontFamily: "var(--font-dm-sans)" }}>Out</span>
        </button>
      </nav>
    </>
  )
}
