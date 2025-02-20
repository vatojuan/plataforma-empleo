// pages/api/job/my-applications.js
import prisma from "../../../lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";

export default async function handler(req, res) {
  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
      return res.status(401).json({ error: "No autorizado" });
    }

    console.log(`📌 Buscando postulaciones del usuario ID: ${session.user.id}`);

    const applications = await prisma.application.findMany({
      where: { userId: Number(session.user.id) },
      include: {
        job: {
          include: {
            _count: { select: { applications: true } },
          },
        },
      },
    });

    return res.status(200).json({ applications });
  } catch (error) {
    console.error("Error al obtener postulaciones:", error);
    return res.status(500).json({ error: error?.message || "Error interno del servidor" });
  }
}
