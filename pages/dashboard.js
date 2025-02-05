// pages/dashboard.js
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect } from "react";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === "loading") return <p>Cargando...</p>;
  if (!session) {
    router.push("/login");
    return null;
  }

  return (
    <div style={{ textAlign: "center", marginTop: "2rem" }}>
      <h1>Dashboard</h1>
      <p>Bienvenido, {session.user.name}</p>
      <p>
        <a href="/profile">Actualizar Perfil</a>
      </p>
      <p>
        <a href="/login" onClick={() => signOut({ callbackUrl: "/login" })}>
          Cerrar sesión
        </a>
      </p>
    </div>
  );
}
