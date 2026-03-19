"use client"

import { signIn } from "next-auth/react"

export default function SignInButton() {
  return (
    <button
      onClick={() => signIn("strava", { callbackUrl: "/dashboard" })}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 12,
        marginTop: 40,
        backgroundColor: "#FC4C02",
        color: "#fff",
        padding: "14px 28px",
        border: "none",
        cursor: "pointer",
        fontSize: 13,
        fontWeight: 600,
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        fontFamily: "var(--font-dm-sans)",
      }}
    >
      Connect with Strava
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" width={13} height={13}>
        <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  )
}
