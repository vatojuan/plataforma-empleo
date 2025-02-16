import prisma from "../../../lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ error: "No autorizado" });
  }
  const employerId = Number(session.user.id);

  if (req.method === "GET") {
    try {
      const employerProfile = await prisma.user.findUnique({
        where: { id: employerId },
      });
      if (!employerProfile) {
        return res.status(404).json({ error: "Perfil no encontrado" });
      }
      return res.status(200).json(employerProfile);
    } catch (error) {
      console.error("Error obteniendo el perfil:", error);
      return res
        .status(500)
        .json({ error: "Error del servidor al obtener el perfil" });
    }
  } else if (req.method === "PUT") {
    if (!req.body || typeof req.body !== "object") {
      return res
        .status(400)
        .json({ error: "No se proporcionó un payload válido" });
    }
    const { name, companyName, description, phone } = req.body;
    try {
      const updatedProfile = await prisma.user.update({
        where: { id: employerId },
        data: { name, companyName, description, phone },
      });
      return res.status(200).json(updatedProfile);
    } catch (error) {
      console.error("Error actualizando el perfil:", error);
      return res.status(500).json({ error: "Error al actualizar el perfil" });
    }
  } else {
    res.setHeader("Allow", ["GET", "PUT"]);
    return res.status(405).json({ error: `Método ${req.method} no permitido` });
  }
}
