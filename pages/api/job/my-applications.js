import prisma from "../../../lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";

export default async function handler(req, res) {
  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
      return res.status(401).json({ error: "No autorizado" });
    }

    console.log("📌 Postulaciones de usuario ID:", session.user.id);

    /* ── 1. Query con select mínimo ───────────────────────────────── */
    const applications = await prisma.application.findMany({
      where: { userId: Number(session.user.id) },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        status: true,
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

    /* ── 2. Serializamos ─────────────────────────────────────────── */
    const formatted = applications.map((app) => ({
      id: app.id,
      status: app.status,
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
