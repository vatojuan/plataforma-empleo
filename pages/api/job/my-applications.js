// pages/api/job/my-applications.js
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
const prisma = new PrismaClient();

export default async function handler(req, res) {
  const session = await getServerSession(req, res);
  if (!session?.user?.id) return res.status(401).json({ error: "Unauth" });

  try {
    const apps = await prisma.application.findMany({
      where:  { userId: Number(session.user.id) },
      orderBy:{ createdAt: "desc" },
      select: {
        id:        true,
        jobId:     true,
        status:    true,
        createdAt: true,
      },
    });

    res.status(200).json({
      applications: apps.map(a => ({
        id: a.id,
        jobId: a.jobId,
        status: a.status,
        createdAt: a.createdAt.toISOString(),
      })),
    });
  } catch (err) {
    console.error("Error applications:", err);
    res.status(500).json({ error: "Internal error", details: err.message });
  }
}
