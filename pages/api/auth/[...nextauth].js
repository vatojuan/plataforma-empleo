import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import prisma from "../../../lib/prisma";
import bcrypt from "bcryptjs";

export default NextAuth({
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV !== "production",
  providers: [
    CredentialsProvider({
      name: "Credenciales",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "tu@correo.com" },
        password: { label: "Contraseña", type: "password" }
      },
      async authorize(credentials) {
        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });
          if (!user) throw new Error("Usuario no encontrado");
          const isValid = await bcrypt.compare(credentials.password, user.password);
          if (!isValid) throw new Error("Contraseña incorrecta");
          if (!user.confirmed) throw new Error("Confirma tu correo antes de iniciar sesión");
          return { id: user.id.toString(), name: user.name, email: user.email, role: user.role };
        } catch (error) {
          throw new Error("Error en la autenticación");
        }
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
        try {
          let existingUser = await prisma.user.findUnique({
            where: { email: user.email },
          });
          if (!existingUser) {
            existingUser = await prisma.user.create({
              data: {
                email: user.email,
                name: user.name,
                role: null, // Queda sin rol para que se seleccione después
                confirmed: true,
                googleId: profile.sub,
              },
            });
          }
          user.id = existingUser.id.toString();
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
      }
      return token;
    },
    async session({ session, token }) {
      try {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email },
        });
        session.user.role = dbUser && dbUser.role ? dbUser.role : token.role || "";
      } catch (error) {
        session.user.role = token.role || "";
      }
      session.user.id = token.id || "";
      session.user.name = token.name || "";
      session.user.email = token.email || "";
      return session;
    }
    // NOTA: No definimos el callback "redirect" aquí para usar el comportamiento por defecto.
  },
  pages: {
    signIn: "/login",
    error: "/auth/error"
  }
});
