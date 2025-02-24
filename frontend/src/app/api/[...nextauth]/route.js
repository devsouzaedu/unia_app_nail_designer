// src/app/api/auth/[...nextauth]/route.js
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

// Força a rota a ser renderizada dinamicamente, sem pré-renderização
export const dynamic = "force-dynamic";
export const revalidate = 0;

const options = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  session: { strategy: "jwt" },
};

const handler = NextAuth(options);

// Exporta somente os handlers HTTP
export { handler as GET, handler as POST };
