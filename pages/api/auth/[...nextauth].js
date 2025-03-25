import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import prisma from "../../../lib/prisma";
import bcrypt from "bcrypt";

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
        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });
          if (!user) throw new Error("Usuario no encontrado");
          if (!user.password)
            throw new Error("Este usuario se registró con Google, usa Google");
          const isValid = await bcrypt.compare(credentials.password, user.password);
          if (!isValid) throw new Error("Contraseña incorrecta");
          if (!user.confirmed)
            throw new Error("Confirma tu correo antes de iniciar sesión");
          return {
            id: user.id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
            image: user.profilePicture || "/images/default-user.png",
          };
        } catch (error) {
          console.error("Error in Credentials authorize:", error);
          throw new Error("Error en la autenticación");
        }
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
        try {
          let existingUser = await prisma.user.findUnique({
            where: { email: user.email },
          });
          if (!existingUser) {
            existingUser = await prisma.user.create({
              data: {
                email: user.email,
                name: user.name,
                role: null, // El usuario deberá seleccionar su rol posteriormente
                confirmed: true,
                googleId: profile.sub,
                profilePicture: user.image || profile.picture,
              },
            });
          }
          user.id = existingUser.id.toString();
          // Si ya existe, no forzamos el cambio de nombre para preservar la edición manual
          user.image = existingUser.profilePicture || user.image;
          user.role = existingUser.role;
        } catch (error) {
          console.error("Error en signIn (Google):", error);
          throw new Error("Error interno");
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      // Asegurarse de que token sea siempre un objeto.
      token = token || {};
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
      }
      return token;
    },
    async session({ session, token }) {
      try {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email },
        });
        if (dbUser) {
          session.user = {
            id: dbUser.id.toString(),
            name: dbUser.name,
            email: dbUser.email,
            role: dbUser.role || "",
            image: dbUser.profilePicture || "/images/default-user.png",
            provider: token.provider, // Agregamos el proveedor aquí
          };
        }
      } catch (error) {
        console.error("Error en session callback:", error);
      }
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
