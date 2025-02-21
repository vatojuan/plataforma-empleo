// pages/api/job/create.js
import prisma from "../../../lib/prisma";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { title, description, requirements, userId } = req.body;
  console.log("Datos recibidos en /api/job/create:", { title, description, requirements, userId });

  if (!title || !description || !userId) {
    return res.status(400).json({ message: "Faltan campos obligatorios" });
  }

  try {
    const job = await prisma.job.create({
      data: {
        title,
        description,
        requirements, // Se agrega el campo "requirements"
        userId: Number(userId),
      },
    });
    return res.status(200).json({ message: "Oferta creada", job });
  } catch (error) {
    console.error("Error creando oferta:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
}
