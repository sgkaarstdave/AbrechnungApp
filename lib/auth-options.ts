import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Login",
      credentials: {
        email: { label: "E-Mail", type: "email" },
        password: { label: "Passwort", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          return null;
        }

        const trainer = await prisma.trainer.findUnique({ where: { email: credentials.email.toLowerCase() } });
        if (!trainer?.passwordHash) {
          return null;
        }

        const isValid = await bcrypt.compare(credentials.password, trainer.passwordHash);
        if (!isValid) {
          return null;
        }

        return {
          id: trainer.id,
          name: trainer.name,
          email: trainer.email,
          role: trainer.role
        };
      }
    })
  ],
  session: {
    strategy: "jwt"
  },
  pages: {
    signIn: "/login"
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: "trainer" | "admin" }).role ?? "trainer";
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = (token.role as "trainer" | "admin") ?? "trainer";
      }
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET
};
