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

  providers: [
    CredentialsProvider({
      name: "Credenciales",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "tu@correo.com" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize({ email, password }) {
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

        const body = new URLSearchParams({ username: email, password });
        const res = await fetch(`${FASTAPI}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: body.toString(),
        });

        if (!res.ok) {
          const text = await res.text();
          console.error("FastAPI /auth/login falló:", text);
          throw new Error("No se pudo autenticar en el backend");
        }
        const { access_token } = await res.json();
        if (!access_token) {
          throw new Error("No se recibió token desde FastAPI");
        }

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

    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],

  callbacks: {
    async signIn({ user, account, profile }) {
      if (account.provider === "google") {
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
          account.fastapiToken = access_token;
        }

        user.id = dbUser.id.toString();
        user.role = dbUser.role;
        user.image = dbUser.profilePicture || user.image;
      }
      return true;
    },

    async jwt({ token, user, account, trigger }) {
      // Al iniciar sesión, se propaga la información del usuario al token.
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.role = user.role;
        token.image = user.image;
        token.provider = account?.provider;
        
        if (user.fastapiToken) {
          token.fastapiToken = user.fastapiToken;
        } else if (account?.fastapiToken) {
          token.fastapiToken = account.fastapiToken;
        }
      }

      // --- ¡ESTA ES LA CORRECCIÓN CLAVE! ---
      // Si el trigger es "update", significa que se llamó a `update()` desde el frontend.
      if (trigger === "update") {
        console.log("JWT Callback: Disparador de actualización detectado. Refrescando datos desde la BD...");
        
        // Volvemos a buscar al usuario en la base de datos para obtener los datos más recientes.
        const dbUser = await prisma.user.findUnique({
          where: { id: Number(token.id) },
        });

        if (dbUser) {
          // Actualizamos el token con la nueva información.
          token.name = dbUser.name;
          token.image = dbUser.profilePicture;
          token.role = dbUser.role; // También actualizamos el rol por si cambia.
          console.log("JWT Callback: Token actualizado con nuevos datos:", { name: token.name, image: token.image, role: token.role });
        } else {
            console.error("JWT Callback: No se pudo encontrar al usuario en la BD durante la actualización.");
        }
      }

      return token;
    },

    async session({ session, token }) {
      session.user = {
        id: token.id,
        name: token.name,
        email: token.email,
        role: token.role,
        image: token.image,
        provider: token.provider,
        token: token.fastapiToken || null,
      };
      return session;
    },
  },

  pages: {
    signIn: "/login",
    error: "/auth/error",
  },
};

export default NextAuth(authOptions);
