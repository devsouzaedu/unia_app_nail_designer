// src/app/api/auth/[...nextauth]/route.js

export const dynamic = "force-dynamic"; // evita pré-renderização estática
export const revalidate = 0;            // não cacheia a rota

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
    // Redireciona para /auth em caso de login ou erro
    signIn: "/auth",
    error: "/auth",
  },
};

const handler = NextAuth(options);

// Exporta somente os handlers GET e POST
export { handler as GET, handler as POST };
