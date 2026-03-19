import NextAuth from "next-auth"
import StravaProvider from "next-auth/providers/strava"
import type { NextAuthOptions } from "next-auth"

export const authOptions: NextAuthOptions = {
  providers: [
    StravaProvider({
      clientId: process.env.NEXT_PUBLIC_STRAVA_CLIENT_ID!,
      clientSecret: process.env.STRAVA_CLIENT_SECRET!,
      authorization: { params: { scope: "activity:read_all" } },
    }),
  ],
  pages: {
    signIn: "/",
  },
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token
      }
      return token
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken
      return session
    },
  },
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
