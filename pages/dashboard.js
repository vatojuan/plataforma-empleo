// pages/dashboard.js
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect } from "react";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Si la sesión aún está cargando, muestra un mensaje de carga.
  if (status === "loading") {
    return <p>Cargando...</p>;
  }

  // Si no hay sesión (usuario no autenticado), redirige al login.
  if (!session) {
    useEffect(() => {
      router.push("/login");
    }, [router]);
    return null;
  }

  return (
    <div style={{ textAlign: "center", marginTop: "2rem" }}>
      <h1>Dashboard</h1>
      <p>Bienvenido, {session.user.name}</p>
      <p>
        <a href="/profile">Ir al Perfil</a>
      </p>
      <p>
        <button onClick={() => signOut({ callbackUrl: "/login" })}>
          Cerrar sesión
        </button>
      </p>
    </div>
  );
}
