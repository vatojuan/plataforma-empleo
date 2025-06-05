// pages/api/auth/[...nextauth].js

import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import prisma from "../../../lib/prisma";
import bcrypt from "bcryptjs";

const FASTAPI = process.env.NEXT_PUBLIC_API_URL || "https://api.fapmendoza.online";

export const authOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV !== "production",

  /*───────────────────────────────────────────────────────────────────
    1. PROVEEDORES DE AUTENTICACIÓN
  ───────────────────────────────────────────────────────────────────*/
  providers: [
    /*── Credenciales (email + contraseña) ──*/
    CredentialsProvider({
      name: "Credenciales",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize({ email, password }) {
        // 1-A) Verificar existencia de usuario en Prisma
        const u = await prisma.user.findUnique({ where: { email } });
        if (!u) throw new Error("Usuario no encontrado");
        if (!u.password) throw new Error("Este usuario se registró con Google");
        if (!u.confirmed) throw new Error("Debes confirmar tu correo antes de iniciar sesión");
        const isValid = await bcrypt.compare(password, u.password);
        if (!isValid) throw new Error("Contraseña incorrecta");

        // 1-B) Solicitar JWT de FastAPI (form-urlencoded)
        const body = new URLSearchParams({ username: email, password });
        const r = await fetch(`${FASTAPI}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: body.toString(),
        });
        if (!r.ok) throw new Error("Backend rechazó las credenciales");
        const { access_token } = await r.json();

        // Devolver objeto user para jwt callback
        return {
          id: u.id.toString(),
          name: u.name,
          email: u.email,
          role: u.role,
          image: u.profilePicture || "/images/default-user.png",
          fastapiToken: access_token, // JWT de FastAPI
        };
      },
    }),

    /*── Google OAuth ──*/
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],

  /*───────────────────────────────────────────────────────────────────
    2. CALLBACKS: signIn, jwt, session
  ───────────────────────────────────────────────────────────────────*/
  callbacks: {
    /* — signIn: sólo para Google */
    async signIn({ user, account, profile }) {
      if (account.provider !== "google") {
        return true;
      }

      // 2-A) Upsert en Prisma: si no existe, crearlo; si existe, actualizar foto/nombre
      const dbUser = await prisma.user.upsert({
        where: { email: user.email },
        update: {
          name: user.name,
          profilePicture: user.image || profile.picture,
        },
        create: {
          email: user.email,
          name: user.name,
          confirmed: true,
          googleId: profile.sub,
          profilePicture: user.image || profile.picture,
        },
      });

      // 2-B) Obtener JWT de FastAPI usando id_token de Google
      if (account.id_token) {
        const r = await fetch(`${FASTAPI}/auth/login-google`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id_token: account.id_token }),
        });
        if (!r.ok) {
          console.warn("FastAPI /auth/login-google devolvió error:", await r.text());
          return false;
        }
        const { access_token } = await r.json();
        account.fastapiToken = access_token; // lo pasaremos al jwt callback
      }

      // 2-C) Propagar datos actuales de BD al objeto `user`
      user.id = dbUser.id.toString();
      user.role = dbUser.role;
      user.image = dbUser.profilePicture || user.image;

      return true;
    },

    /* — jwt: consolidar y persistir datos en el token */
    async jwt({ token, user, account }) {
      // 1ª vez con credenciales: fastapiToken viene en user.fastapiToken
      if (user?.fastapiToken) {
        token.fastapiToken = user.fastapiToken;
      }
      // 1ª vez con Google: fastapiToken viene en account.fastapiToken
      if (account?.fastapiToken) {
        token.fastapiToken = account.fastapiToken;
      }

      // Siempre propagar datos de `user` al JWT en la primera invocación
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.role = user.role;
        token.image = user.image;
      }
      // Registrar proveedor
      if (account) {
        token.provider = account.provider;
      }
      return token;
    },

    /* — session: qué datos recibe el frontend */
    async session({ session, token }) {
      session.user = {
        id: token.id,
        name: token.name,
        email: token.email,
        role: token.role,
        image: token.image,
        provider: token.provider,
        token: token.fastapiToken || null, // este es el JWT de FastAPI
      };
      return session;
    },
  },

  /*───────────────────────────────────────────────────────────────────
    3. Páginas personalizadas
  ───────────────────────────────────────────────────────────────────*/
  pages: {
    signIn: "/login",
    error: "/auth/error",
  },
};

export default NextAuth(authOptions);
