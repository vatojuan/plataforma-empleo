// pages/api/auth/[...nextauth].js
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

export default NextAuth({
  secret: process.env.NEXTAUTH_SECRET,
  debug: true, // Opcional, para ver más detalles en la consola
  providers: [
    // Proveedor de credenciales (sigue existiendo para pruebas)
    CredentialsProvider({
      name: "Credenciales",
      credentials: {
        username: { label: "Usuario", type: "text", placeholder: "Usuario" },
        password: { label: "Contraseña", type: "password" }
      },
      async authorize(credentials) {
        // Para pruebas: solo autoriza demo/demo o acepta cualquier credencial (temporal)
        if (credentials.username === "demo" && credentials.password === "demo") {
          return { id: "1", name: "Usuario Demo", email: "demo@example.com" };
        }
        // Para pruebas alternativas: aceptar cualquier usuario
        return { id: "1", name: credentials.username, email: `${credentials.username}@example.com` };
      }
    }),
    // Agrega el proveedor de Google
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET
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
    error: "/auth/error" // Opcional, crea una página de error en pages/auth/error.js si lo deseas
  }
});
