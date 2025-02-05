// pages/api/auth/[...nextauth].js
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export default NextAuth({
  secret: process.env.NEXTAUTH_SECRET,
  debug: true, // para ver logs detallados
  providers: [
    CredentialsProvider({
      name: "Credenciales",
      credentials: {
        username: { label: "Usuario", type: "text", placeholder: "Usuario" },
        password: { label: "Contraseña", type: "password" }
      },
      async authorize(credentials) {
        // Para pruebas: siempre devuelve un usuario, sin importar las credenciales
        return { id: "1", name: credentials.username || "Usuario Demo", email: "demo@example.com" };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.name = token.name;
      return session;
    }
  },
  pages: {
    signIn: "/login",
    error: "/auth/error" // Opcional: para personalizar errores
  }
});
