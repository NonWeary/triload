# Triload — Claude Code Context



## What this project is

Triload is a standalone triathlon training load dashboard. Athletes connect their Strava account and see their CTL (fitness), ATL (fatigue), and TSB (form) over time — the "performance management chart" that coaches use but most athletes only get behind a TrainingPeaks paywall.

This is a real product, not a portfolio toy. It will be shared with the triathlon community and eventually serve as the onboarding tool for a coaching business called Simplified Endurance.

## The three-prong vision

Every decision in this codebase should serve at least one of these goals:

**1. Training & qualification**
The developer is an active triathlete training toward Kona qualification. Triload is built and used by someone who actually trains — this should inform what features matter. CTL/ATL/TSB math must be accurate. The tool should be something a serious age grouper trusts.

**2. Coaching (Simplified Endurance)**
Long-term, Triload becomes the onboarding layer for a paid coaching community. Friends and informal athletes will use it first. Features should be built with eventual multi-user and coach-dashboard expansion in mind — don't paint into architectural corners.

**3. Development / portfolio**
This project lives at the intersection of marketing, data, and endurance athletics — Charlie Gall's personal brand. Code should be clean and explainable. The app should look polished enough to share publicly and link from charlie-gall.com.

## Tech stack

- **Framework:** Next.js (App Router, TypeScript)
- **Auth:** NextAuth v4 with Strava OAuth provider
- **Styling:** Tailwind CSS
- **Charts:** Recharts
- **Data:** Strava API (no database — calculations run client-side from API responses)
- **Hosting:** Vercel

## Design principles

- Always light mode — force `color-scheme: light` regardless of system preference
- Warm off-white backgrounds (#F7F4EF page, #FFFDF9 cards) — not cold grays
- Strava orange (#FC4C02) is the only strong accent color
- Typography: DM Serif Display for headings and stat numbers, DM Sans for body
- Cards: 1px border (#E8E2D9), 6px border radius, subtle warm shadow
- Feels handcrafted and analog — not like a generic AI-generated dashboard
- Sidebar: 56px collapsed icon-only nav on desktop, bottom nav on mobile


## Training load math

- Load per activity = `suffer_score` if available, else `(moving_time / 3600) * 100`
- CTL = 42-day exponentially weighted average (α = 1/42)
- ATL = 7-day exponentially weighted average (α = 1/7)
- TSB = CTL − ATL
- Values rounded to 1 decimal place
- CTL and ATL share one Y-axis; TSB gets its own Y-axis to prevent compression


## What good looks like

A serious age grouper opens the app, connects Strava, and immediately understands their training status without needing an explanation. The insight card does the interpreting for them. The chart shows their story over the past 90 days. It loads fast, looks trustworthy, and feels like something worth sharing with a training partner.

## What to avoid
- Generic dashboard aesthetics (enterprise SaaS look)
- Scope creep into coaching features before the core tool is polished and deployed
