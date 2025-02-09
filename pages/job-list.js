// pages/job-list.js
import { useEffect, useState } from "react";
import Link from "next/link";

export default function JobList() {
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    async function fetchJobs() {
      const res = await fetch("/api/job/list");
      if (res.ok) {
        const data = await res.json();
        setJobs(data.jobs);
      }
    }
    fetchJobs();
  }, []);

  return (
    <div style={{ textAlign: "center", marginTop: "2rem" }}>
      <h1>Ofertas de Empleo</h1>
      {jobs.length === 0 ? (
        <p>No hay ofertas publicadas.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {jobs.map((job) => (
            <li key={job.id} style={{ marginBottom: "1rem", borderBottom: "1px solid #ccc", paddingBottom: "1rem" }}>
              <h2>{job.title}</h2>
              <p>{job.description}</p>
              <p>
                Publicado por: {job.user.name} ({job.user.role})
              </p>
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
