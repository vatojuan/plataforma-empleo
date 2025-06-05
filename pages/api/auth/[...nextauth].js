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
    // Credenciales (email + contraseña)
    CredentialsProvider({
      name: "Credenciales",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize({ email, password }) {
        // 1-A) Validar usuario en Prisma
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) throw new Error("Usuario no encontrado");
        if (!user.password) throw new Error("Registrado con Google, usa Google");
        if (!user.confirmed) throw new Error("Debes confirmar tu correo para iniciar sesión");

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) throw new Error("Contraseña incorrecta");

        // 1-B) Hacer login contra FastAPI usando x-www-form-urlencoded
        const form = new URLSearchParams();
        form.append("username", email);
        form.append("password", password);

        const res = await fetch(`${FASTAPI}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: form.toString(),
        });
        if (!res.ok) {
          console.error("FastAPI /auth/login falló:", await res.text());
          throw new Error("Backend rechazó las credenciales");
        }
        const { access_token } = await res.json();

        return {
          id: user.id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          image: user.profilePicture || "/images/default-user.png",
          accessToken: access_token, // JWT de FastAPI
        };
      },
    }),

    // Google Provider
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],

  callbacks: {
    async signIn({ user, account, profile }) {
      // Solo interceptamos si viene de Google
      if (account.provider === "google") {
        // 2-A) Upsert en Prisma
        let dbUser = await prisma.user.findUnique({ where: { email: user.email } });
        if (!dbUser) {
          dbUser = await prisma.user.create({
            data: {
              email: user.email,
              name: user.name,
              role: null, 
              confirmed: true,
              googleId: profile.sub,
              profilePicture: user.image || profile.picture,
            },
          });
        } else if (!dbUser.profilePicture) {
          dbUser = await prisma.user.update({
            where: { id: dbUser.id },
            data: { profilePicture: user.image || profile.picture },
          });
        }

        // 2-B) Solicitar JWT a FastAPI con el id_token de Google
        if (account.id_token) {
          const res = await fetch(`${FASTAPI}/auth/login-google`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id_token: account.id_token }),
          });
          if (res.ok) {
            const { access_token } = await res.json();
            user.accessToken = access_token;
          } else {
            console.warn("FastAPI /auth/login-google devolvió error:", await res.text());
          }
        }

        // 2-C) Asegurarnos de propagar la info de BD al objeto `user`
        user.id = dbUser.id.toString();
        user.image = dbUser.profilePicture || user.image;
        user.role = dbUser.role;
      }

      return true;
    },

    async jwt({ token, user, account }) {
      // Si se está logueando, almacenamos info en el JWT
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.role = user.role;
        token.image = user.image;
        token.accessToken = user.accessToken || null; // JWT de FastAPI
      }
      if (account) {
        token.provider = account.provider;
      } else if (!token.provider) {
        token.provider = "credentials";
      }
      return token;
    },

    async session({ session, token }) {
      // Exponemos session.user con el JWT de FastAPI
      session.user = {
        id: token.id,
        name: token.name,
        email: token.email,
        role: token.role,
        image: token.image,
        provider: token.provider,
        token: token.accessToken, // este es el JWT que usarás en fetch()
      };
      return session;
    },
  },

  pages: {
    signIn: "/login",
    error: "/auth/error",
  },

  cookies: {
    sessionToken: {
      name:
        process.env.NODE_ENV === "production"
          ? "__Secure-next-auth.session-token"
          : "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
};

export default NextAuth(authOptions);
