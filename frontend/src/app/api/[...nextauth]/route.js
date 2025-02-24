export const dynamic = "force-dynamic";
export const revalidate = 0;

import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const options = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/auth",
    error: "/auth",
  },
  // Redefine o logger para evitar chamadas a /api/auth/_log
  logger: {
    debug() {},
    warn() {},
    error() {},
  },
};

const handler = NextAuth(options);

export { handler as GET, handler as POST };
