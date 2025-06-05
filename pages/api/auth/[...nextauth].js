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
        // 1-A) Validar existencia de usuario en Prisma
        const u = await prisma.user.findUnique({ where: { email } });
        if (!u) {
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

        // 1-B) Solicitar JWT al backend FastAPI usando form-urlencoded
        const body = new URLSearchParams({ username: email, password });
        const res = await fetch(`${FASTAPI}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: body.toString(),
        });

        if (!res.ok) {
          // Si FastAPI responde 401 o similar, NextAuth lanzará error
          const text = await res.text();
          console.error("FastAPI /auth/login falló:", text);
          throw new Error("No se pudo autenticar en el backend");
        }
        const { access_token } = await res.json();
        if (!access_token) {
          throw new Error("No se recibió token desde FastAPI");
        }

        // 1-C) Devolver un objeto de usuario que NextAuth almacenará en el JWT interno
        return {
          id: u.id.toString(),
          name: u.name,
          email: u.email,
          role: u.role,
          image: u.profilePicture || "/images/default-user.png",
          fastapiToken: access_token,
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
    /* — signIn: intercepta posterior a login exitoso, antes de generar el JWT interno */
    async signIn({ user, account, profile }) {
      // Solo intervenir si viene de Google
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

        // 2-B) Solicitar JWT a FastAPI usando el id_token de Google
        if (account.id_token) {
          const r = await fetch(`${FASTAPI}/auth/login-google`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id_token: account.id_token }),
          });
          if (!r.ok) {
            console.warn("FastAPI /auth/login-google devolvió error:", await r.text());
            return false; // Cancela el inicio de sesión si el backend falla
          }
          const { access_token } = await r.json();
          account.fastapiToken = access_token;
        }

        // 2-C) Propagar datos de la BD al objeto `user`
        user.id = dbUser.id.toString();
        user.role = dbUser.role;
        user.image = dbUser.profilePicture || user.image;
      }

      return true;
    },

    /* — jwt: se ejecuta cada vez que se firma en o refresca sesión */
    async jwt({ token, user, account }) {
      // 3-A) Si vino de Credenciales, user.fastapiToken está definido
      if (user?.fastapiToken) {
        token.fastapiToken = user.fastapiToken;
      }

      // 3-B) Si vino de Google, account.fastapiToken está definido
      if (account?.fastapiToken) {
        token.fastapiToken = account.fastapiToken;
      }

      // 3-C) Propagar info del usuario al token interno
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.role = user.role;
        token.image = user.image;
      }

      // 3-D) Guardar el proveedor (credentials / google)
      if (account) {
        token.provider = account.provider;
      }

      return token;
    },

    /* — session: define qué ve el frontend en session.user */
    async session({ session, token }) {
      session.user = {
        id: token.id,
        name: token.name,
        email: token.email,
        role: token.role,
        image: token.image,
        provider: token.provider,
        // Este es el JWT de FastAPI que vas a usar en tus fetchs:
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
