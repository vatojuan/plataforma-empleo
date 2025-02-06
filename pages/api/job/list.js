// pages/api/job/list.js
import prisma from "../../../lib/prisma";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const jobs = await prisma.job.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: { name: true, email: true, role: true },
        },
      },
    });
    return res.status(200).json({ jobs });
  } catch (error) {
    console.error("Error listando ofertas:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
}
