import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [applications, setApplications] = useState([]);

  useEffect(() => {
    if (status !== "loading" && !session) {
      router.push("/login");
    } else if (session && !session.user.role) {
      router.push("/select-role");
    }
  }, [status, session, router]);

  // Cargar postulaciones si el usuario es empleado
  useEffect(() => {
    async function fetchApplications() {
      if (session && session.user.role === "empleado") {
        const res = await fetch("/api/job/my-applications");
        if (res.ok) {
          const data = await res.json();
          setApplications(data.applications);
        }
      }
    }
    if (status !== "loading") {
      fetchApplications();
    }
  }, [session, status]);

  if (status === "loading" || !session || !session.user.role) {
    return <p>Cargando...</p>;
  }

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    window.location.href = "/login";
  };

  // Función para cancelar postulaciones desde el dashboard (empleados)
  const handleCancelApplication = async (jobId) => {
    if (confirm("¿Deseas cancelar tu postulación a este empleo?")) {
      try {
        const res = await fetch("/api/job/cancel-application", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ jobId }),
        });
        if (res.ok) {
          alert("Postulación cancelada");
          const updatedRes = await fetch("/api/job/my-applications");
          if (updatedRes.ok) {
            const data = await updatedRes.json();
            setApplications(data.applications);
          }
        } else {
          alert("Error al cancelar la postulación");
        }
      } catch (error) {
        console.error("Error al cancelar la postulación:", error);
        alert("Error al cancelar la postulación");
      }
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "2rem" }}>
      <h1>Dashboard</h1>
      <p>
        <Link href="/">Inicio</Link>
      </p>
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
          <h2>Mis Postulaciones</h2>
          {applications.length === 0 ? (
            <p>No has postulado a ningún empleo.</p>
          ) : (
            <ul style={{ listStyle: "none", padding: 0 }}>
              {applications.map((app) => (
                <li key={app.id} style={{ marginBottom: "0.5rem" }}>
                  <Link href={`/job-offer?id=${app.job.id}`}>
                    {app.job.title}
                  </Link>{" "}
                  <button onClick={() => handleCancelApplication(app.job.id)}>
                    Cancelar Postulación
                  </button>
                </li>
              ))}
            </ul>
          )}
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
