import prisma from "../../../lib/prisma";
import fetch from "node-fetch"; // Asegúrate de tenerlo instalado: npm install node-fetch

// Función para obtener el embedding de la oferta usando OpenAI
async function getJobEmbedding(text) {
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
    if (!data?.data?.[0]?.embedding || !Array.isArray(data.data[0].embedding)) {
      throw new Error("Respuesta inesperada de OpenAI API");
    }

    return data.data[0].embedding; // Devuelve el array de embedding
  } catch (error) {
    console.error("⚠️ Error al generar embedding:", error.message);
    return null; // Devuelve `null` para indicar fallo en la generación del embedding
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  // Extraemos expirationDate además de los demás campos
  const { title, description, requirements, userId, expirationDate } = req.body;
  console.log("Datos recibidos en /api/job/create:", { title, description, requirements, userId, expirationDate });

  if (!title || !description || !userId) {
    return res.status(400).json({ message: "Faltan campos obligatorios" });
  }

  let embedding = null;
  try {
    const jobText = `${title}\n\n${description}\n\n${requirements || ""}`;
    embedding = await getJobEmbedding(jobText);

    if (embedding) {
      console.log("✅ Embedding generado exitosamente");
    } else {
      console.warn("⚠️ No se generó el embedding, se procederá sin él.");
    }
  } catch (error) {
    console.error("❌ Error al procesar embedding:", error.message);
  }

  try {
    // Construir el objeto `jobData` dinámicamente
    const jobData = {
      title,
      description,
      requirements,
      userId: Number(userId),
    };

    // Convertir y agregar la fecha de expiración si se proporciona
    if (expirationDate) {
      jobData.expirationDate = new Date(expirationDate);
    }

    // Solo agregamos `embedding` si se generó correctamente
    if (embedding) {
      jobData.embedding = embedding;
    }

    const job = await prisma.job.create({ data: jobData });
    console.log("✅ Oferta creada exitosamente:", job);
    return res.status(200).json({ message: "Oferta creada", job });
  } catch (error) {
    console.error("❌ Error creando oferta:", error);
    return res.status(500).json({ message: "Error interno del servidor", error: error.message });
  }
}
