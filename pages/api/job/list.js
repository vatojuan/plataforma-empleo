// pages/api/job/list.js
import { PrismaClient } from "@prisma/client";
import { parse } from "url";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  try {
    const { query }   = parse(req.url, true);
    const userIdParam = query.userId ? Number(query.userId) : null;

    const where = userIdParam && !isNaN(userIdParam)
      ? { userId: userIdParam }   // ❗️ Usa este filtro **solo** si userId existe en tu modelo
      : {};

    const jobs = await prisma.job.findMany({
      where,
      orderBy: { createdAt: "desc" },
      // ⬇⬇  **SOLO** campos que EXISTEN en tu modelo Job  ⬇⬇
      select: {
        id:            true,
        title:         true,
        description:   true,
        requirements:  true,
        createdAt:     true,
        expirationDate:true,
        // ‼️  NO pongas aquí ningún otro campo si no
        //     aparece en schema.prisma
        _count: {
          select: { applications: true },
        },
      },
    });

    const formatted = jobs.map((j) => ({
      id:              j.id,
      title:           j.title,
      description:     j.description,
      requirements:    j.requirements ?? null,
      postedAt:        j.createdAt.toISOString(),
      expirationDate:  j.expirationDate ? j.expirationDate.toISOString() : null,
      candidatesCount: j._count.applications,
    }));

    return res.status(200).json({ jobs: formatted });
  } catch (error) {
    console.error("Error fetching jobs:", error);
    return res
      .status(500)
      .json({ error: "Error interno del servidor", details: error.message });
  }
}
