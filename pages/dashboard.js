// pages/dashboard.js
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect } from "react";
import Link from "next/link";

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

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    window.location.href = "/login";
  };

  return (
    <div style={{ textAlign: "center", marginTop: "2rem" }}>
      <h1>Dashboard</h1>
      {/* Botón de Inicio */}
      <p>
        <Link href="/">Inicio</Link>
      </p>
      {/* Mostrar imagen de perfil */}
      <img
        src={session.user.image || "/images/default-user.png"}
        alt="Imagen de perfil"
        style={{
          width: "100px",
          height: "100px",
          borderRadius: "50%",
          objectFit: "cover",
          border: "2px solid #ccc",
          marginBottom: "1rem",
        }}
      />
      <p>Bienvenido, {session.user.name}</p>
      <p>Tu rol: {session.user.role}</p>
      {session.user.role === "empleado" ? (
        <div>
          <p>
            <Link href="/job-list">Ver ofertas de empleo</Link>
          </p>
          <p>
            <Link href="/profile-empleado">Actualizar Perfil</Link>
          </p>
        </div>
      ) : (
        <div>
          <p>
            <Link href="/job-create">Publicar Oferta de Empleo</Link>
          </p>
          <p>
            <Link href="/job-list">Mis Ofertas Publicadas</Link>
          </p>
          <p>
            <Link href="/profile-empleador">Actualizar Perfil</Link>
          </p>
        </div>
      )}
      <button
        onClick={handleSignOut}
        style={{
          marginTop: "2rem",
          padding: "0.5rem 1rem",
          fontSize: "1rem",
          cursor: "pointer",
        }}
      >
        Cerrar sesión
      </button>
    </div>
  );
}
