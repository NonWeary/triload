"use client"

import { signOut } from "next-auth/react"

export default function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="rounded-full px-6 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
      style={{ backgroundColor: "#FC4C02" }}
    >
      Sign Out
    </button>
  )
}
