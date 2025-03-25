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
            select: {
              id: true,
              email: true,
              name: true,
              password: true,
              role: true,
              confirmed: true,
              profilePicture: true,
            },
          });

          if (!user) throw new Error("Usuario no encontrado");
          if (!user.password) throw new Error("Este usuario se registró con Google, usa Google");
          if (!user.confirmed) throw new Error("Confirma tu correo antes de iniciar sesión");

          const isValid = await bcrypt.compare(credentials.password, user.password);
          if (!isValid) throw new Error("Contraseña incorrecta");

          return {
            id: user.id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
            image: user.profilePicture || "/images/default-user.png",
          };
        } catch (error) {
          console.error("❌ Error en authorize:", error.message);
          throw new Error(error.message || "Error en la autenticación");
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      // Puedes usar 'profile' si deseas un flujo distinto:
      // https://next-auth.js.org/configuration/providers/oauth#using-a-custom-profile
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // Si el provider es Google, actualizamos/creamos el usuario en la base de datos
      if (account.provider === "google") {
        try {
          let existingUser = await prisma.user.findUnique({
            where: { email: user.email },
            select: {
              id: true,
              email: true,
              name: true,
              role: true,
              confirmed: true,
              profilePicture: true,
            },
          });

          if (!existingUser) {
            existingUser = await prisma.user.create({
              data: {
                email: user.email,
                name: user.name,
                role: null, // El usuario definirá su rol después
                confirmed: true,
                googleId: profile?.sub || null,
                profilePicture: user.image || profile?.picture || null,
              },
            });
          }

          // Devolvemos un user "sintético" para NextAuth
          return {
            id: existingUser.id.toString(),
            name: existingUser.name,
            email: existingUser.email,
            role: existingUser.role,
            image: existingUser.profilePicture || null,
          };
        } catch (error) {
          console.error("❌ Error en signIn (Google):", error);
          return false;
        }
      }
      return true;
    },

    async jwt({ token, user, account }) {
      try {
        if (account) {
          token.provider = account.provider;
        }
        if (user) {
          token.id = user.id;
          token.name = user.name;
          token.email = user.email;
          token.role = user.role;
          token.image = user.image;
        }
        return token;
      } catch (err) {
        console.error("❌ Error en jwt callback:", err);
        return token;
      }
    },

    async session({ session, token }) {
      try {
        if (!token?.email) return session;

        const dbUser = await prisma.user.findUnique({
          where: { email: token.email },
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            profilePicture: true,
          },
        });

        if (dbUser) {
          session.user = {
            id: dbUser.id.toString(),
            name: dbUser.name,
            email: dbUser.email,
            role: dbUser.role || "",
            image: dbUser.profilePicture || "/images/default-user.png",
            provider: token.provider,
          };
        } else {
          session.user = null;
        }
      } catch (error) {
        console.error("❌ Error en session callback:", error);
        session.user = null;
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
