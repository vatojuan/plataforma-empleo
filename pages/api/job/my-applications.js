// pages/api/job/my-applications.js
import { PrismaClient } from "@prisma/client";
import { getSession }   from "next-auth/react";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  try {
    const session = await getSession({ req });
    if (!session?.user?.id) {
      return res.status(401).json({ error: "No autenticado" });
    }
    const userId = Number(session.user.id);

    const apps = await prisma.application.findMany({
      where:  { userId },
      orderBy:{ createdAt: "desc" },
      select: {
        id:        true,
        jobId:     true,
        status:    true,
        createdAt: true,
      },
    });

    return res.status(200).json({
      applications: apps.map((a) => ({
        id:        a.id,
        jobId:     a.jobId,
        status:    a.status,
        createdAt: a.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error("Error fetching applications:", error);
    return res
      .status(500)
      .json({ error: "Error interno", details: error.message });
  }
}
