import prisma from "../../../lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import fetch from "node-fetch";

// Función para obtener el embedding de la descripción usando OpenAI
async function getUserEmbedding(text) {
  try {
    const response = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "text-embedding-ada-002",
        input: text,
      }),
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error("Error en OpenAI API: " + errorText);
    }
    const data = await response.json();
    console.log("✅ Embedding generado exitosamente");
    return data.data[0].embedding;
  } catch (error) {
    console.error("❌ Error generando embedding:", error.message);
    return null; // Permite continuar sin embedding si ocurre algún error
  }
}

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ error: "No autorizado" });
  }
  const employerId = Number(session.user.id);

  if (req.method === "GET") {
    try {
      // Se incluye el campo embedding en la respuesta
      const employerProfile = await prisma.user.findUnique({
        where: { id: employerId },
        select: {
          id: true,
          name: true,
          companyName: true,
          description: true,
          phone: true,
          profilePicture: true,
          embedding: true,
        },
      });
      if (!employerProfile) {
        return res.status(404).json({ error: "Perfil no encontrado" });
      }
      return res.status(200).json(employerProfile);
    } catch (error) {
      console.error("Error obteniendo el perfil:", error);
      return res.status(500).json({ error: "Error del servidor al obtener el perfil" });
    }
  } else if (req.method === "PUT") {
    if (!req.body || typeof req.body !== "object") {
      return res.status(400).json({ error: "No se proporcionó un payload válido" });
    }
    const { name, companyName, description, phone } = req.body;
    console.log(`🔄 Actualizando perfil del empleador ${employerId}`);
    let embedding = null;
    if (description) {
      console.log("🔍 Generando embedding para la descripción...");
      embedding = await getUserEmbedding(description);
      if (!embedding) {
        console.warn("⚠️ No se pudo generar el embedding, se procederá sin actualizarlo");
      }
    }

    try {
      const updateData = { name, companyName, description, phone };
      if (embedding) {
        updateData.embedding = embedding;
      }
      const updatedProfile = await prisma.user.update({
        where: { id: employerId },
        data: updateData,
      });
      console.log(`✅ Perfil actualizado correctamente para empleador ${employerId}`);
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
