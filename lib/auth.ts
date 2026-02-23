import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { requireSupabaseAdmin } from "@/lib/supabase";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    CredentialsProvider({
      name: "Email / Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) return null;

        try {
          const admin = requireSupabaseAdmin();
          const { data, error } = await admin.auth.signInWithPassword({
            email: credentials.email,
            password: credentials.password,
          });
          if (error || !data.user) return null;

          return {
            id: data.user.id,
            email: data.user.email,
            name: data.user.user_metadata?.name ?? data.user.email,
          };
        } catch {
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.email = user.email;
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.email = typeof token.email === "string" ? token.email : null;
        session.user.name = typeof token.name === "string" ? token.name : null;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
