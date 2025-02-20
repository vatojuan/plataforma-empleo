import prisma from "../../../lib/prisma";

export default async function handler(req, res) {
  try {
    const userId = req.query.userId ? Number(req.query.userId) : null;
    // Si se pasa userId en la query, se filtran las ofertas del usuario
    const jobs = await prisma.job.findMany({
      where: userId ? { userId } : {},
      orderBy: { createdAt: "desc" },
      include: { applications: true },
    });

    // Formateamos cada oferta para enviar datos serializables
    const formattedJobs = jobs.map((job) => ({
      id: job.id,
      title: job.title,
      description: job.description,
      requirements: job.requirements || null,
      // Usamos createdAt como postedAt y lo convertimos a string ISO
      postedAt: job.createdAt ? new Date(job.createdAt).toISOString() : "",
      candidatesCount: job.applications ? job.applications.length : 0,
    }));

    return res.status(200).json({ jobs: formattedJobs });
  } catch (error) {
    console.error("Error fetching jobs:", error);
    return res.status(500).json({
      error: "Error interno del servidor",
      details: error.message || "Sin detalles",
    });
  }
}
