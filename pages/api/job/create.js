// pages/api/job/create.js
// ---------------------------------------------------------
//  Crea una oferta de empleo y guarda el vector de embedding
//  evitando el bug P2023 (vector) de Prisma
// ---------------------------------------------------------

import prisma from "../../../lib/prisma";
import fetch  from "node-fetch";          // npm i node-fetch@^3

/** Convierte un array JS en literal pgvector → [0.1,0.2,0.3] */
function toVectorLiteral(arr) {
  return `[${arr.join(",")}]`;
}

/** Genera embedding con la API de OpenAI; devuelve null si falla */
async function getJobEmbedding(text) {
  try {
    const r = await fetch("https://api.openai.com/v1/embeddings", {
      method : "POST",
      headers: {
        "Content-Type" : "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "text-embedding-ada-002",
        input: text,
      }),
    });

    if (!r.ok) throw new Error(await r.text());
    const data = await r.json();
    const vec  = data?.data?.[0]?.embedding;
    if (!Array.isArray(vec)) throw new Error("Formato de embedding inesperado");
    return vec;
  } catch (err) {
    console.error("⚠️  Embedding error:", err.message);
    return null;
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { title, description, requirements, userId, expirationDate } = req.body;

  if (!title || !description || !userId) {
    return res.status(400).json({ message: "Faltan campos obligatorios" });
  }

  // 1⃣  Generar embedding (opcional)
  const embedding = await getJobEmbedding(
    `${title}\n\n${description}\n\n${requirements || ""}`
  );

  try {
    // 2⃣  Crear la oferta SIN incluir la columna vector
    //     y seleccionando solo el id para que Prisma
    //     no intente des-serializar el tipo `vector`
    const created = await prisma.job.create({
      data: {
        title,
        description,
        requirements,
        userId: Number(userId),
        expirationDate: expirationDate ? new Date(expirationDate) : null,
      },
      select: { id: true },
    });

    // 3⃣  Si hay embedding se inserta con SQL crudo
    if (embedding) {
      await prisma.$executeRawUnsafe(`
        UPDATE "Job"
           SET embedding = ${toVectorLiteral(embedding)}::vector
         WHERE id = ${created.id};
      `);
    }

    return res
      .status(200)
      .json({ message: "Oferta creada", jobId: created.id });
  } catch (err) {
    console.error("❌  Error creando oferta:", err);
    return res
      .status(500)
      .json({ message: "Error interno del servidor", error: err.message });
  }
}
