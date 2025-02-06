// pages/job-offer.js
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function JobOffer() {
  const router = useRouter();
  const { id } = router.query;
  const [job, setJob] = useState(null);

  useEffect(() => {
    if (id) {
      async function fetchJob() {
        const res = await fetch("/api/job/list");
        if (res.ok) {
          const data = await res.json();
          const found = data.jobs.find((j) => j.id.toString() === id);
          setJob(found);
        }
      }
      fetchJob();
    }
  }, [id]);

  if (!job) {
    return (
      <div style={{ textAlign: "center", marginTop: "2rem" }}>
        <h1>Oferta no encontrada</h1>
        <p>
          <Link href="/job-list">Volver a la lista de ofertas</Link>
        </p>
      </div>
    );
  }

  return (
    <div style={{ textAlign: "center", marginTop: "2rem" }}>
      <h1>{job.title}</h1>
      <p>{job.description}</p>
      <p>
        Publicado por: {job.user.name} ({job.user.role})
      </p>
      <p>
        <Link href="/job-list">Volver a la lista de ofertas</Link>
      </p>
    </div>
  );
}
