// pages/job-offer.js
import { useRouter } from "next/router";

export default function JobOffer() {
  const router = useRouter();
  const { id } = router.query;

  // Datos simulados para detalle; en un futuro, se puede hacer fetch a un backend usando el ID.
  const jobDetails = {
    1: { title: "Analista de Datos", description: "Buscamos un analista con experiencia en análisis de datos y visualización. Requisitos: manejo de SQL, R o Python." },
    2: { title: "Desarrollador Full Stack", description: "Se requiere desarrollador con conocimientos en Next.js, Node.js y bases de datos relacionales." },
    3: { title: "Especialista en Recursos Humanos", description: "Responsable de procesos de selección, entrevistas y evaluación de candidatos." },
  };

  // Si el ID no existe en los datos simulados, muestra un mensaje.
  if (!id || !jobDetails[id]) {
    return (
      <div style={{ textAlign: "center", marginTop: "2rem" }}>
        <h1>Oferta no encontrada</h1>
        <p>
          <a href="/job-list">Volver a la lista de ofertas</a>
        </p>
      </div>
    );
  }

  const job = jobDetails[id];

  return (
    <div style={{ textAlign: "center", marginTop: "2rem" }}>
      <h1>{job.title}</h1>
      <p>{job.description}</p>
      <p>
        <a href="/job-list">Volver a la lista de ofertas</a>
      </p>
    </div>
  );
}
