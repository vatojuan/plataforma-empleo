// pages/job-list.js
export default function JobList() {
  const jobs = [
    { id: 1, title: "Analista de Datos", description: "Experiencia en análisis estadístico y manejo de bases de datos." },
    { id: 2, title: "Desarrollador Full Stack", description: "Conocimiento en Next.js, Node.js y bases de datos SQL." },
    { id: 3, title: "Especialista en Recursos Humanos", description: "Experiencia en procesos de selección y reclutamiento." },
  ];

  return (
    <div style={{ textAlign: "center", marginTop: "2rem" }}>
      <h1>Ofertas de Empleo</h1>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {jobs.map((job) => (
          <li key={job.id} style={{ marginBottom: "1rem", borderBottom: "1px solid #ccc", paddingBottom: "1rem" }}>
            <h2>{job.title}</h2>
            <p>{job.description}</p>
            <a href={`/job-offer?id=${job.id}`}>Ver Detalles</a>
          </li>
        ))}
      </ul>
      <p>
        <a href="/dashboard">Volver al Dashboard</a>
      </p>
    </div>
  );
}
