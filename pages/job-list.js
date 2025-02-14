import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";

export default function JobList() {
  const { data: session, status } = useSession();
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);

  useEffect(() => {
    async function fetchJobs() {
      let url = "/api/job/list";
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
    async function fetchApplications() {
      if (session && session.user.role === "empleado") {
        const res = await fetch("/api/job/my-applications");
        if (res.ok) {
          const data = await res.json();
          setApplications(data.applications);
        } else {
          console.error("Error al obtener tus postulaciones");
        }
      }
    }
    if (status !== "loading") {
      fetchJobs();
      fetchApplications();
    }
  }, [session, status]);

  const isApplied = (jobId) => {
    return applications.some(app => app.jobId === jobId);
  };

  const handleApply = async (jobId) => {
    try {
      const res = await fetch("/api/job/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId }),
      });
      if (res.ok) {
        alert("Has postulado exitosamente");
        const appRes = await fetch("/api/job/my-applications");
        if (appRes.ok) {
          const data = await appRes.json();
          setApplications(data.applications);
        }
      } else {
        const errorData = await res.json();
        alert("Error: " + errorData.error);
      }
    } catch (error) {
      console.error("Error al postular:", error);
      alert("Error al postular");
    }
  };

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
          const appRes = await fetch("/api/job/my-applications");
          if (appRes.ok) {
            const data = await appRes.json();
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
              {session.user.role === "empleado" && (
                <div>
                  {isApplied(job.id) ? (
                    <button onClick={() => handleCancelApplication(job.id)}>
                      Cancelar Postulación
                    </button>
                  ) : (
                    <button onClick={() => handleApply(job.id)}>
                      Postularme
                    </button>
                  )}
                </div>
              )}
              {session.user.role === "empleador" && (
                <>
                  <Link href={`/job-offer?id=${job.id}`}>Ver Detalles</Link>
                  {" "}
                  <button onClick={() => handleDeleteJob(job.id)}>
                    Eliminar
                  </button>
                </>
              )}
              {session.user.role === "empleado" && (
                <Link href={`/job-offer?id=${job.id}`}>Ver Detalles</Link>
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
