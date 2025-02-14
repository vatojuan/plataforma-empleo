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
          console.error("Error en Credentials authorize:", error);
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
            // Si el usuario no existe, lo creamos con los datos de Google
            existingUser = await prisma.user.create({
              data: {
                email: user.email,
                name: user.name,
                role: null, // El usuario deberá seleccionar su rol posteriormente
                confirmed: true,
                googleId: profile.sub,
                profilePicture: profile.picture,
              },
            });
          } else {
            // Si el usuario existe, NO actualizamos el nombre para conservar el valor actualizado manualmente.
            // Opcional: Actualizar la imagen solo si el usuario tiene el valor por defecto
            if (!existingUser.profilePicture || existingUser.profilePicture === "/images/default-user.png") {
              existingUser = await prisma.user.update({
                where: { email: user.email },
                data: { profilePicture: profile.picture },
              });
            }
          }
          // Actualizar los datos para la sesión, tomando los valores que ya existen en la BD
          user.id = existingUser.id.toString();
          user.role = existingUser.role || null;
          user.image = existingUser.profilePicture || "/images/default-user.png";
          // No sobrescribimos user.name si ya existe
          // Así, si el usuario modificó su nombre, se conserva.
        } catch (error) {
          console.error("Error en signIn (Google):", error);
          throw new Error("Error interno");
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
        token.picture = user.image || "/images/default-user.png";
      }
      return token;
    },
    async session({ session, token }) {
      console.log("SESSION CALLBACK - Token recibido:", token);
      if (token?.email) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { email: token.email },
          });
          session.user.role = dbUser?.role ?? token.role ?? "";
          session.user.image = dbUser?.profilePicture || token.picture || "/images/default-user.png";
          session.user.name = dbUser?.name || token.name || "";
        } catch (error) {
          console.error("Error en session callback:", error);
          session.user.role = token.role || "";
          session.user.image = token.picture || "/images/default-user.png";
          session.user.name = token.name || "";
        }
      } else {
        session.user.role = token.role || "";
        session.user.image = token.picture || "/images/default-user.png";
        session.user.name = token.name || "";
      }
      session.user.id = token.id || "";
      session.user.email = token.email || "";
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/auth/error",
  },
};

export default NextAuth(authOptions);
