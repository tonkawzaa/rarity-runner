import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { upsertUser } from "./lib/db/models/user"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        // Save user to database after successful Google OAuth login
        if (user.email && user.id) {
          await upsertUser({
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
            email_verified: profile?.email_verified as boolean || false,
          });
        }
        return true;
      } catch (error) {
        console.error("Error saving user to database:", error);
        // Still allow login even if database save fails
        return true;
      }
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub as string
      }
      return session
    },
  },
  pages: {
    signIn: "/",
  },
})
