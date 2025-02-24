import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

// Configuração do NextAuth com secret
const options = {
  secret: process.env.NEXTAUTH_SECRET, // Defina essa variável no .env.local e no ambiente de produção
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  session: { strategy: "jwt" },
  // Outras configurações podem ser adicionadas aqui
};

const handler = NextAuth(options);

// Exporte somente os handlers HTTP
export { handler as GET, handler as POST };
