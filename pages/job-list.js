import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";

export default function JobList() {
  const { data: session, status } = useSession();
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    async function fetchJobs() {
      let url = "/api/job/list";
      // Si el usuario es empleador, filtra sus propias ofertas
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
