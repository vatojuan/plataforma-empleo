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

  // ───────────────────────────────────────────────────────────────
  // 1. PROVEEDORES DE AUTENTICACIÓN
  // ───────────────────────────────────────────────────────────────
  providers: [
    /* ─── Credenciales (email + contraseña) ─── */
    CredentialsProvider({
      name: "Credenciales",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "tu@correo.com" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize({ email, password }) {
        // 1-A) Validar que exista el usuario en Prisma
        const u = await prisma.user.findUnique({ where: { email } });
        if (!u) {
          // Si no existe, NextAuth retornará null y redireccionará a /login?error=
          throw new Error("Usuario no encontrado");
        }
        if (!u.password) {
          throw new Error("Este usuario se registró con Google. Usa Google para iniciar sesión.");
        }
        if (!u.confirmed) {
          throw new Error("Debes confirmar tu correo antes de iniciar sesión.");
        }
        const isValid = await bcrypt.compare(password, u.password);
        if (!isValid) {
          throw new Error("Contraseña incorrecta");
        }

        // 1-B) Solicitar el JWT de FastAPI usando form-urlencoded:
        const body = new URLSearchParams({ username: email, password });
        const res = await fetch(`${FASTAPI}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: body.toString(),
        });

        if (!res.ok) {
          const text = await res.text();
          console.error("FastAPI /auth/login respondió con error:", text);
          throw new Error("No se pudo autenticar en el backend");
        }

        const { access_token } = await res.json();
        if (!access_token) {
          console.error("FastAPI devolvió un JSON sin access_token:", await res.text());
          throw new Error("No se generó el token de sesión");
        }

        // 1-C) Si todo OK, devolvemos el "user" para que nextAuth lo guarde en el JWT interno:
        return {
          id: u.id.toString(),
          name: u.name,
          email: u.email,
          role: u.role,
          image: u.profilePicture || "/images/default-user.png",
          fastapiToken: access_token, // <- este campo será transferido al token JWT
        };
      },
    }),

    /* ─── Google OAuth ─── */
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],

  // ───────────────────────────────────────────────────────────────
  // 2. CALLBACKS
  // ───────────────────────────────────────────────────────────────
  callbacks: {
    /* — signIn: intercepta después de un login exitoso, antes de generar el JWT interno */
    async signIn({ user, account, profile }) {
      // Si proviene de Google, hacemos upsert en Prisma y pedimos JWT al backend:
      if (account.provider === "google") {
        // 2-A) Upsert en Prisma
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

        // 2-B) Pedir JWT a FastAPI usando el id_token que entrega Google
        if (account.id_token) {
          const r = await fetch(`${FASTAPI}/auth/login-google`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id_token: account.id_token }),
          });
          if (!r.ok) {
            console.warn("FastAPI /auth/login-google devolvió error:", await r.text());
            // Si falla el backend, no permitimos el login:
            return false;
          }
          const { access_token } = await r.json();
          account.fastapiToken = access_token; // lo guardamos en "account"
        }

        // 2-C) Propagamos datos actualizados de la BD a `user`
        user.id = dbUser.id.toString();
        user.role = dbUser.role;
        user.image = dbUser.profilePicture || user.image;
      }
      return true;
    },

    /* — jwt: construye el JWT que NextAuth guardará internamente */
    async jwt({ token, user, account }) {
      // 3-A) Si el login fue con Credenciales, `user.fastapiToken` existe:
      if (user?.fastapiToken) {
        token.fastapiToken = user.fastapiToken;
      }
      // 3-B) Si el login fue con Google, `account.fastapiToken` existe:
      if (account?.fastapiToken) {
        token.fastapiToken = account.fastapiToken;
      }

      // 3-C) En la primera invocación, el objeto `user` existe:
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.role = user.role;
        token.image = user.image;
      }

      // 3-D) Siempre almacenamos el proveedor (credentials / google)
      if (account) {
        token.provider = account.provider;
      }

      return token;
    },

    /* — session: aquí definimos qué ve el frontend en `session.user` */
    async session({ session, token }) {
      session.user = {
        id: token.id,
        name: token.name,
        email: token.email,
        role: token.role,
        image: token.image,
        provider: token.provider,
        // Este es el JWT que usarás para consultar tu API de FastAPI:
        token: token.fastapiToken || null,
      };
      return session;
    },
  },

  // ───────────────────────────────────────────────────────────────
  // 3. PÁGINAS PERSONALIZADAS (opcional)
  // ───────────────────────────────────────────────────────────────
  pages: {
    signIn: "/login",
    error: "/auth/error",
  },
};

export default NextAuth(authOptions);
