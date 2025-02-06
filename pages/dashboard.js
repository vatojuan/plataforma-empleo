// pages/dashboard.js
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect } from "react";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status !== "loading" && !session) {
      router.push("/login");
    } else if (session && !session.user.role) {
      router.push("/select-role");
    }
  }, [status, session, router]);

  if (status === "loading" || !session || !session.user.role) {
    return <p>Cargando...</p>;
  }

  return (
    <div style={{ textAlign: "center", marginTop: "2rem" }}>
      <h1>Dashboard</h1>
      <p>Bienvenido, {session.user.name}</p>
      <p>Tu rol: {session.user.role}</p>
      {session.user.role === "empleado" ? (
        <div>
          <p>
            <a href="/job-list">Ver ofertas de empleo</a>
          </p>
          <p>
            <a href="/profile-empleado">Actualizar Perfil</a>
          </p>
        </div>
      ) : (
        <div>
          <p>
            <a href="/job-offer">Publicar Oferta de Empleo</a>
          </p>
          <p>
            <a href="/profile-empleador">Actualizar Perfil</a>
          </p>
        </div>
      )}
      <p>
        <button onClick={() => signOut({ callbackUrl: "/login" })}>
          Cerrar sesión
        </button>
      </p>
    </div>
  );
}
