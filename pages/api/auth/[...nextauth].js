// pages/api/auth/[...nextauth].js

import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import prisma from "../../../lib/prisma";
import bcrypt from "bcryptjs";

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
      async authorize(credentials) {
        // 1) Validar usuario en Prisma
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });
        if (!user) throw new Error("Usuario no encontrado");
        if (!user.password) throw new Error("Este usuario se registró con Google, usa Google");
        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) throw new Error("Contraseña incorrecta");
        if (!user.confirmed) throw new Error("Confirma tu correo antes de iniciar sesión");

        // 2) Pedir JWT a FastAPI
        const fastapiRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              username: credentials.email,
              password: credentials.password,
            }),
          }
        );
        if (!fastapiRes.ok) {
          console.error("FastAPI /auth/login falló:", await fastapiRes.text());
          throw new Error("No se pudo autenticar en el backend");
        }
        const fastapiData = await fastapiRes.json();
        // fastapiData = { access_token: "<JWT>", token_type: "bearer" }

        return {
          id: user.id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          image: user.profilePicture || "/images/default-user.png",
          accessToken: fastapiData.access_token, // JWT de FastAPI
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
        // 1) Crear o actualizar usuario en Prisma
        let existingUser = await prisma.user.findUnique({
          where: { email: user.email },
        });
        if (!existingUser) {
          existingUser = await prisma.user.create({
            data: {
              email: user.email,
              name: user.name,
              role: null, // Asignar luego
              confirmed: true,
              googleId: profile.sub,
              profilePicture: user.image || profile.picture,
            },
          });
        } else if (!existingUser.profilePicture) {
          existingUser = await prisma.user.update({
            where: { id: existingUser.id },
            data: { profilePicture: user.image || profile.picture },
          });
        }
        user.id = existingUser.id.toString();
        user.image = existingUser.profilePicture || user.image;
        user.role = existingUser.role;

        // 2) Pedir JWT a FastAPI usando ID token de Google
        const idToken = account.id_token;
        if (idToken) {
          const fastapiRes = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/auth/login-google`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ id_token: idToken }),
            }
          );
          if (fastapiRes.ok) {
            const fastapiData = await fastapiRes.json();
            user.accessToken = fastapiData.access_token;
          } else {
            console.warn(
              "FastAPI /auth/login-google devolvió error:",
              await fastapiRes.text()
            );
          }
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      // token es el objeto persistido; user existe solo en el primer login
      if (account) {
        token.provider = account.provider;
      } else if (!token.provider) {
        token.provider = "credentials";
      }
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.role = user.role;
        token.image = user.image;
        token.accessToken = user.accessToken || null;
      }
      return token;
    },
    async session({ session, token }) {
      // Exponer session.user con JWT de FastAPI
      session.user = {
        id: token.id,
        name: token.name,
        email: token.email,
        role: token.role,
        image: token.image,
        provider: token.provider,
        token: token.accessToken, // JWT de FastAPI
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
