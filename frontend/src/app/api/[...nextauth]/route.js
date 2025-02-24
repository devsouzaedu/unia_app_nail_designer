// src/app/api/auth/[...nextauth]/route.js

export const dynamic = "force-dynamic";
export const revalidate = 0;

import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const options = {
  secret: process.env.NEXTAUTH_SECRET,
  // Certifique-se de que a variável NEXTAUTH_URL está definida (por exemplo, no Vercel):
  // NEXTAUTH_URL=https://unia-app-nail-designer.onrender.com
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
  // Silencia os logs para evitar chamadas indevidas a /api/auth/_log
  logger: {
    debug: () => {},
    warn: () => {},
    error: () => {},
  },
};

const handler = NextAuth(options);

export { handler as GET, handler as POST };
