// pages/api/job/list.js

import { PrismaClient } from "@prisma/client";
import { parse } from "url";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  try {
    // Parseamos userId de la querystring (si se envía)
    const { query } = parse(req.url, true);
    const userIdParam = query.userId ? Number(query.userId) : null;

    // Construimos el filtro “where”:
    //  • Si userIdParam tiene valor, filtramos por ese userId
    //  • Si no, devolvemos todas las ofertas
    const whereFilter = userIdParam !== null && !isNaN(userIdParam)
      ? { userId: userIdParam }
      : {};

    // Hacemos la consulta a la tabla `job`, EXCLUYENDO cualquier columna vectorial.
    // Con `select` pedimos SOLO los campos que necesitamos y 
    // con `_count: { select: { applications: true } }` obtenemos la
    // cantidad de postulaciones sin traer todo el objeto “applications”.
    const jobs = await prisma.job.findMany({
      where: whereFilter,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        description: true,
        requirements: true,
        createdAt: true,
        expirationDate: true,
        // NO seleccionamos `embedding` (vector)
        // NO seleccionamos `embedding: true`
        // Solo pedimos los campos que el frontend necesita:
        userId: true,
        source: true,
        label: true,

        // Obtenemos el conteo de postulaciones sin traer todo el array
        _count: {
          select: { applications: true }
        }
      },
    });

    // Mapeamos a la forma que tu frontend espera:
    const formattedJobs = jobs.map((job) => ({
      id: job.id,
      title: job.title,
      description: job.description,
      requirements: job.requirements ?? null,
      postedAt: job.createdAt ? job.createdAt.toISOString() : "",
      expirationDate: job.expirationDate
        ? job.expirationDate.toISOString()
        : null,
      candidatesCount: job._count.applications,
      // Si el front espera otros campos como userId/source/label, 
      // puedes agregarlos aquí. Ej:
      // userId: job.userId,
      // source: job.source,
      // label: job.label,
    }));

    return res.status(200).json({ jobs: formattedJobs });
  } catch (error) {
    console.error("Error fetching jobs:", error);
    return res.status(500).json({
      error: "Error interno del servidor",
      details: error.message ?? "Sin detalles",
    });
  }
}
