// pages/api/auth/[...nextauth].js
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider       from "next-auth/providers/google";
import prisma  from "../../../lib/prisma";
import bcrypt  from "bcryptjs";

const FASTAPI = process.env.NEXT_PUBLIC_API_URL || "https://api.fapmendoza.online";

/*───────────────────────────────────────────────────────────
  1. Opciones Next-Auth
───────────────────────────────────────────────────────────*/
export const authOptions = {
  secret : process.env.NEXTAUTH_SECRET,
  debug  : process.env.NODE_ENV !== "production",

  /*────────────── PROVEEDORES ──────────────*/
  providers: [
    /*··· Credenciales ···*/
    CredentialsProvider({
      name: "Credenciales",
      credentials: {
        email   : { label: "Email",      type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize({ email, password }) {
        /* 1-A) Validar usuario */
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user)                throw new Error("Usuario no encontrado");
        if (!user.password)       throw new Error("Registrado con Google");
        if (!user.confirmed)      throw new Error("Confirma tu correo");

        const ok = await bcrypt.compare(password, user.password);
        if (!ok)                  throw new Error("Contraseña incorrecta");

        /* 1-B) Pedir token FastAPI  ––>  **USA form-urlencoded**  */
        const body = new URLSearchParams({ username: email, password });
        const res  = await fetch(`${FASTAPI}/auth/login`, {
          method : "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body   : body.toString(),
        });
        if (!res.ok) {
          console.error("FastAPI /auth/login:", await res.text());
          throw new Error("Backend rechazó las credenciales");
        }
        const { access_token } = await res.json();

        return {
          id   : user.id.toString(),
          name : user.name,
          email: user.email,
          role : user.role,
          image: user.profilePicture || "/images/default-user.png",
          accessToken: access_token,
        };
      },
    }),

    /*··· Google ···*/
    GoogleProvider({
      clientId    : process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],

  /*────────────── CALLBACKS ──────────────*/
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account.provider !== "google") return true;

      /* 2-A) Upsert en Prisma */
      let dbUser = await prisma.user.findUnique({ where: { email: user.email } });
      if (!dbUser) {
        dbUser = await prisma.user.create({
          data: {
            email : user.email,
            name  : user.name,
            role  : null,
            confirmed: true,
            googleId : profile.sub,
            profilePicture: user.image || profile.picture,
          },
        });
      } else if (!dbUser.profilePicture) {
        dbUser = await prisma.user.update({
          where: { id: dbUser.id },
          data : { profilePicture: user.image || profile.picture },
        });
      }

      /* 2-B) Pedir token FastAPI con id_token */
      if (account.id_token) {
        const res = await fetch(`${FASTAPI}/auth/login-google`, {
          method : "POST",
          headers: { "Content-Type": "application/json" },
          body   : JSON.stringify({ id_token: account.id_token }),
        });
        if (res.ok) {
          const { access_token } = await res.json();
          user.accessToken = access_token;
        } else {
          console.warn("FastAPI /auth/login-google:", await res.text());
        }
      }

      /* 2-C) Ajustar objeto user para jwt() */
      user.id    = dbUser.id.toString();
      user.image = dbUser.profilePicture || user.image;
      user.role  = dbUser.role;

      return true;
    },

    async jwt({ token, user, account }) {
      if (account) token.provider = account.provider;
      if (!token.provider) token.provider = "credentials";

      if (user) {
        token.id          = user.id;
        token.name        = user.name;
        token.email       = user.email;
        token.role        = user.role;
        token.image       = user.image;
        token.accessToken = user.accessToken || null;
      }
      return token;
    },

    async session({ session, token }) {
      session.user = {
        id      : token.id,
        name    : token.name,
        email   : token.email,
        role    : token.role,
        image   : token.image,
        provider: token.provider,
        token   : token.accessToken,  // JWT FastAPI
      };
      return session;
    },
  },

  /*────────────── Páginas Customizadas ──────────────*/
  pages: {
    signIn: "/login",
    error : "/auth/error",
  },

  /*────────────── Cookie name coherente ──────────────*/
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === "production"
        ? "__Secure-next-auth.session-token"
        : "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path    : "/",
        secure  : process.env.NODE_ENV === "production",
      },
    },
  },
};

export default NextAuth(authOptions);
