// pages/api/auth/[...nextauth].js
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import prisma from "../../../lib/prisma";
import bcrypt from "bcryptjs";

export default NextAuth({
  secret: process.env.NEXTAUTH_SECRET,
  debug: true,
  providers: [
    CredentialsProvider({
      name: "Credenciales",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "tu@correo.com" },
        password: { label: "Contraseña", type: "password" }
      },
      async authorize(credentials) {
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });
        if (!user) {
          throw new Error("Usuario no encontrado");
        }
        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) {
          throw new Error("Contraseña incorrecta");
        }
        if (!user.confirmed) {
          throw new Error("Por favor, confirma tu correo antes de iniciar sesión");
        }
        return { id: user.id.toString(), name: user.name, email: user.email, role: user.role };
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET
    })
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account.provider === "google") {
        let existingUser = await prisma.user.findUnique({
          where: { email: user.email },
        });
        if (!existingUser) {
          existingUser = await prisma.user.create({
            data: {
              email: user.email,
              name: user.name,
              role: null, // Se crea sin rol; el usuario deberá seleccionarlo
              confirmed: true, // Consideramos confirmado el email para OAuth
            },
          });
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      // Actualiza el rol leyendo el usuario actualizado desde la base de datos
      try {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email },
        });
        session.user.role = dbUser?.role || token.role;
      } catch (error) {
        session.user.role = token.role;
      }
      session.user.id = token.id;
      session.user.name = token.name;
      session.user.email = token.email;
      return session;
    }
  },
  pages: {
    signIn: "/login",
    error: "/auth/error"
  }
});
