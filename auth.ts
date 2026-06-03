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
          console.log('Saving user to database with Google ID:', user.id);
          const dbUser = await upsertUser({
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
            email_verified: profile?.email_verified as boolean || false,
          });
          // Overwrite user.id with the real DB id so the JWT token gets the correct value
          user.id = dbUser.id;
          console.log('User saved to database with DB ID:', dbUser.id);
        }
        return true;
      } catch (error) {
        console.error("Error saving user to database:", error);
        return false;
      }
    },
    async jwt({ token, user }) {
      // On first sign-in `user` is populated; persist the real DB id into the token
      if (user?.id) {
        token.sub = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/",
  },
})

