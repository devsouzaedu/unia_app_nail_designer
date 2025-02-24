import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const authOptions = {
  // Configuração dos provedores de autenticação
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  session: {
    strategy: "jwt",
  },
  // Outras configurações opcionais podem ser adicionadas aqui
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
