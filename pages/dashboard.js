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
    // Usa signOut sin redirección automática y luego redirige manualmente
    await signOut({ redirect: false });
    window.location.href = "/login";
  };

  return (
    <div style={{ textAlign: "center", marginTop: "2rem" }}>
      <h1>Dashboard</h1>
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
