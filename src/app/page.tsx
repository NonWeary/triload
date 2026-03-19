import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "./api/auth/[...nextauth]/route"
import SignInButton from "./SignInButton"

export default async function Home() {
  const session = await getServerSession(authOptions)
  if (session) redirect("/dashboard")

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F4EFE6", overflow: "hidden" }}>
      {/* Header */}
      <header className="px-8 py-6 flex justify-center">
        <span
          style={{
            fontFamily: "var(--font-playfair)",
            fontStyle: "italic",
            fontSize: 20,
            color: "#FC4C02",
            letterSpacing: "-0.01em",
          }}
        >
          Triload
        </span>
      </header>

      {/* Main hero */}
      <main className="flex flex-col items-center text-center px-8 pt-16 md:pt-24">
        <h1
          style={{
            fontFamily: "var(--font-playfair)",
            fontStyle: "italic",
            fontSize: "clamp(60px, 11vw, 104px)",
            lineHeight: 0.95,
            color: "#1A1208",
            fontWeight: 400,
            letterSpacing: "-0.02em",
          }}
        >
          See your
          <br />
          <span style={{ color: "#FC4C02" }}>training load.</span>
        </h1>

        <p
          className="mt-8 text-base max-w-sm"
          style={{ color: "#7A6E5F", lineHeight: 1.75, fontFamily: "var(--font-dm-sans)" }}
        >
          Connect to Strava.
        </p>

        <SignInButton />

        {/* Ruled lines — editorial decoration */}
        <div className="mt-16 w-full max-w-xs space-y-px" style={{ opacity: 0.35 }}>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{ height: 1, backgroundColor: "#DDD5C4" }} />
          ))}
        </div>
      </main>

      {/* Decorative concentric circles */}
      <div style={{ position: "fixed", right: "-120px", bottom: "-120px", pointerEvents: "none" }}>
        {[480, 340, 210].map((size) => (
          <div
            key={size}
            style={{
              position: "absolute",
              width: size,
              height: size,
              borderRadius: "50%",
              border: "1px solid #DDD5C4",
              bottom: 0,
              right: 0,
            }}
          />
        ))}
      </div>
    </div>
  )
}
