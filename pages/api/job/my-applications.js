import prisma from "../../../lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";

export default async function handler(req, res) {
  try {
    // ───── Autenticación ─────
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
      return res.status(401).json({ error: "No autorizado" });
    }

    // ───── Consultar postulaciones ─────
    const applications = await prisma.application.findMany({
      where: { userId: Number(session.user.id) },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        jobId: true,
        createdAt: true,
        job: {
          select: {
            id: true,
            title: true,
            _count: { select: { applications: true } },
          },
        },
      },
    });

    // ───── Formatear fechas para JSON ─────
    const formatted = applications.map((app) => ({
      id: app.id,
      jobId: app.jobId,
      createdAt: app.createdAt.toISOString(),
      job: {
        id: app.job.id,
        title: app.job.title,
        candidatesCount: app.job._count.applications,
      },
    }));

    return res.status(200).json({ applications: formatted });
  } catch (error) {
    console.error("Error al obtener postulaciones:", error);
    return res
      .status(500)
      .json({ error: error.message || "Error interno del servidor" });
  }
}
