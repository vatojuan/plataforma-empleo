import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";

export default function JobList() {
  const { data: session, status } = useSession();
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    async function fetchJobs() {
      let url = "/api/job/list";
      // Si el usuario es empleador, filtra solo sus ofertas
      if (session && session.user.role === "empleador") {
        url += `?userId=${session.user.id}`;
      }
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setJobs(data.jobs);
      } else {
        console.error("Error al obtener las ofertas");
      }
    }
    if (status !== "loading") {
      fetchJobs();
    }
  }, [session, status]);

  // Función para eliminar una oferta
  const handleDeleteJob = async (jobId) => {
    if (confirm("¿Estás seguro de que deseas eliminar esta oferta?")) {
      try {
        const res = await fetch("/api/job/delete", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ jobId }),
        });
        if (res.ok) {
          // Actualizar la lista de ofertas
          setJobs(jobs.filter((job) => job.id !== jobId));
          alert("Oferta eliminada correctamente.");
        } else {
          alert("Error al eliminar la oferta.");
        }
      } catch (error) {
        console.error("Error al eliminar la oferta:", error);
        alert("Error al eliminar la oferta.");
      }
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "2rem" }}>
      <h1>Ofertas de Empleo</h1>
      {jobs.length === 0 ? (
        <p>No hay ofertas publicadas.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {jobs.map((job) => (
            <li
              key={job.id}
              style={{
                marginBottom: "1rem",
                borderBottom: "1px solid #ccc",
                paddingBottom: "1rem",
              }}
            >
              <h2>{job.title}</h2>
              <p>{job.description}</p>
              {/* Mostrar quién publicó la oferta solo para empleados */}
              {session.user.role !== "empleador" && (
                <p>
                  Publicado por: {job.user.name} ({job.user.role})
                </p>
              )}
              <Link href={`/job-offer?id=${job.id}`}>Ver Detalles</Link>
              {session.user.role === "empleador" && (
                <>
                  {" "}
                  <button onClick={() => handleDeleteJob(job.id)}>
                    Eliminar
                  </button>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
      <p>
        <Link href="/dashboard">Volver al Dashboard</Link>
      </p>
    </div>
  );
}
