// pages/api/job/my-applications.js

import { getSession } from "next-auth/react";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  try {
    // Verificamos que el usuario esté autenticado (next-auth)
    const session = await getSession({ req });
    if (!session || !session.user || !session.user.id) {
      return res.status(401).json({ error: "No autenticado" });
    }
    const userId = Number(session.user.id);

    // Solo seleccionamos los campos que necesitamos de “application”
    // y nunca arrastramos ningún campo vectorial.
    const apps = await prisma.application.findMany({
      where: { userId: userId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        jobId: true,
        status: true,
        createdAt: true,
        // Si luego quieres mostrar datos del job (por ejemplo título),
        // haz un select explícito con join. Ej:
        // job: {
        //   select: { title: true }
        // }
      },
    });

    // Formateamos para el frontend de Next.js
    const formatted = apps.map((app) => ({
      id: app.id,
      jobId: app.jobId,
      status: app.status,
      createdAt: app.createdAt.toISOString(),
    }));

    return res.status(200).json({ applications: formatted });
  } catch (error) {
    console.error("Error fetching applications:", error);
    return res.status(500).json({
      error: "Error interno al obtener las postulaciones",
      details: error.message ?? "Sin detalles",
    });
  }
}
