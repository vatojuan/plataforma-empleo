// pages/api/auth/[...nextauth].js
import NextAuth            from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider      from "next-auth/providers/google";
import prisma              from "../../../lib/prisma";
import bcrypt              from "bcryptjs";

const FASTAPI = process.env.NEXT_PUBLIC_API_URL || "https://api.fapmendoza.online";

/* ══════════════════════════════════════
   CONFIG
   ══════════════════════════════════════ */
export const authOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  debug : process.env.NODE_ENV !== "production",

  /* ─────── PROVEEDORES ─────── */
  providers: [
    CredentialsProvider({
      name: "Credenciales",
      credentials: {
        email   : { label: "Email",      type: "email"    },
        password: { label: "Contraseña", type: "password" }
      },
      async authorize ({ email, password }) {
        /* 1 - Validar en Prisma */
        const dbUser = await prisma.user.findUnique({ where: { email } });
        if (!dbUser)                throw new Error("Usuario no encontrado");
        if (!dbUser.password)       throw new Error("Registrado con Google");
        if (!dbUser.confirmed)      throw new Error("Confirma tu correo");
        if (!await bcrypt.compare(password, dbUser.password))
          throw new Error("Contraseña incorrecta");

        /* 2 - JWT de FastAPI (x-www-form-urlencoded) */
        const body = new URLSearchParams({ username: email, password });
        const r    = await fetch(`${FASTAPI}/auth/login`, {
          method : "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body   : body.toString()
        });
        if (!r.ok) {
          console.error("FastAPI /auth/login:", await r.text());
          throw new Error("Backend rechazó las credenciales");
        }
        const { access_token } = await r.json();

        return {
          id   : dbUser.id.toString(),
          name : dbUser.name,
          email: dbUser.email,
          role : dbUser.role,
          image: dbUser.profilePicture || "/images/default-user.png",
          accessToken: access_token                       // ★
        };
      }
    }),

    GoogleProvider({
      clientId    : process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET
    })
  ],

  /* ─────── CALLBACKS ─────── */
  callbacks: {
    /* signIn – solo necesitamos lógica extra si proviene de Google  */
    async signIn({ user, account, profile }) {
      if (account.provider !== "google") return true;

      /* A – Upsert del usuario en Prisma */
      let dbUser = await prisma.user.upsert({
        where : { email: user.email },
        update: {
          name           : user.name,
          profilePicture : user.image || profile.picture
        },
        create: {
          email          : user.email,
          name           : user.name,
          confirmed      : true,
          googleId       : profile.sub,
          profilePicture : user.image || profile.picture
        }
      });

      /* B – JWT de FastAPI con id_token */
      if (account.id_token) {
        const r = await fetch(`${FASTAPI}/auth/login-google`, {
          method : "POST",
          headers: { "Content-Type": "application/json" },
          body   : JSON.stringify({ id_token: account.id_token })
        });
        if (r.ok) {
          const { access_token } = await r.json();
          user.accessToken = access_token;               // ★
        } else {
          console.warn("FastAPI /auth/login-google:", await r.text());
          return false;                                  // aborta sign-in
        }
      }

      /* C – Propagar datos definitivos a `user` (irá a jwt) */
      user.id    = dbUser.id.toString();
      user.role  = dbUser.role;
      user.image = dbUser.profilePicture || user.image;
      return true;
    },

    /* jwt – persiste info entre requests */
    async jwt({ token, user, account }) {
      if (user) {                                       // primer login
        token.id          = user.id;
        token.name        = user.name;
        token.email       = user.email;
        token.role        = user.role;
        token.image       = user.image;
        token.accessToken = user.accessToken || null;
      }
      if (account && !token.provider) token.provider = account.provider;
      return token;
    },

    /* session – expone datos al frontend */
    async session({ session, token }) {
      session.user = {
        id      : token.id,
        name    : token.name,
        email   : token.email,
        role    : token.role,
        image   : token.image,
        provider: token.provider,
        token   : token.accessToken                     // ★ aquí lo usa useAuthUser
      };
      return session;
    }
  },

  pages: {
    signIn: "/login",
    error : "/auth/error"
  },

  /* cookie consistente */
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === "production"
        ? "__Secure-next-auth.session-token"
        : "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path    : "/",
        secure  : process.env.NODE_ENV === "production"
      }
    }
  }
};

export default NextAuth(authOptions);
