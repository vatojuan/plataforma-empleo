// pages/api/auth/[...nextauth].js
import NextAuth            from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider      from "next-auth/providers/google";
import prisma              from "../../../lib/prisma";
import bcrypt              from "bcryptjs";

const FASTAPI = process.env.NEXT_PUBLIC_API_URL || "https://api.fapmendoza.online";

export const authOptions = {
  secret : process.env.NEXTAUTH_SECRET,
  debug  : process.env.NODE_ENV !== "production",

  /* ───────────────────── PROVEEDORES ───────────────────── */
  providers: [
    CredentialsProvider({
      name: "Credenciales",
      credentials: {
        email   : { label: "Email",      type: "email"    },
        password: { label: "Contraseña", type: "password" }
      },
      async authorize({ email, password }) {
        /* 1 — validar en Prisma */
        const u = await prisma.user.findUnique({ where: { email } });
        if (!u)                 throw new Error("Usuario no encontrado");
        if (!u.password)        throw new Error("Registrado con Google");
        if (!u.confirmed)       throw new Error("Confirma tu correo");
        if (!await bcrypt.compare(password, u.password))
          throw new Error("Contraseña incorrecta");

        /* 2 — token FastAPI */
        const body = new URLSearchParams({ username: email, password });
        const r = await fetch(`${FASTAPI}/auth/login`, {
          method : "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body   : body.toString()
        });
        if (!r.ok) throw new Error("Backend rechazó las credenciales");
        const { access_token } = await r.json();

        return {
          id   : u.id.toString(),
          name : u.name,
          email: u.email,
          role : u.role,
          image: u.profilePicture || "/images/default-user.png",
          fastapiToken: access_token                 // <── NOMBRE ÚNICO
        };
      }
    }),

    GoogleProvider({
      clientId    : process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET
    })
  ],

  /* ───────────────────── CALLBACKS ───────────────────── */
  callbacks: {

    /* — signIn: flujo Google — */
    async signIn({ user, account, profile }) {
      if (account.provider !== "google") return true;

      /* Upsert en Prisma */
      const dbUser = await prisma.user.upsert({
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

      /* Token FastAPI con id_token */
      if (account.id_token) {
        const r = await fetch(`${FASTAPI}/auth/login-google`, {
          method : "POST",
          headers: { "Content-Type": "application/json" },
          body   : JSON.stringify({ id_token: account.id_token })
        });
        if (r.ok) {
          const { access_token } = await r.json();
          account.fastapiToken = access_token;     // <── se enviará a jwt()
        } else {
          console.warn("/auth/login-google →", await r.text());
          return false;
        }
      }

      /* Propagar datos */
      user.id    = dbUser.id.toString();
      user.role  = dbUser.role;
      user.image = dbUser.profilePicture || user.image;
      return true;
    },

    /* — jwt: consolidamos datos — */
    async jwt({ token, user, account }) {
      // 1ª vez (credenciales):
      if (user?.fastapiToken) token.fastapiToken = user.fastapiToken;

      // 1ª vez (google):
      if (account?.fastapiToken) token.fastapiToken = account.fastapiToken;

      if (user) {
        token.id    = user.id;
        token.name  = user.name;
        token.email = user.email;
        token.role  = user.role;
        token.image = user.image;
      }
      if (account) token.provider = account.provider;
      return token;
    },

    /* — session: lo que recibe el front — */
    async session({ session, token }) {
      session.user = {
        id      : token.id,
        name    : token.name,
        email   : token.email,
        role    : token.role,
        image   : token.image,
        provider: token.provider,
        token   : token.fastapiToken || null      // <── SI ESTÁ VACÍO ⇒ problema
      };
      return session;
    }
  },

  pages: { signIn: "/login", error: "/auth/error" }
};

export default NextAuth(authOptions);
