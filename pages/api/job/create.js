// pages/api/job/create.js
// ---------------------------------------------------------------------
// Crea una oferta, genera embedding (OpenAI) y lo guarda en columna pgvector
// ---------------------------------------------------------------------

import prisma from "../../../lib/prisma";
import fetch from "node-fetch";            // npm i node-fetch@^3

/* ---------- Constantes --------------------------------------------- */

const OPENAI_URL   = "https://api.openai.com/v1/embeddings";
const OPENAI_MODEL = "text-embedding-ada-002";

/* ---------- Utilidades --------------------------------------------- */

/** Devuelve array<number> con 1536 floats o null si falla */
async function getJobEmbedding(text) {
  try {
    const r = await fetch(OPENAI_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({ model: OPENAI_MODEL, input: text }),
    });
    if (!r.ok) throw new Error(await r.text());

    const data = await r.json();
    const emb  = data?.data?.[0]?.embedding;
    if (!Array.isArray(emb)) throw new Error("Respuesta inesperada");
    return emb;
  } catch (err) {
    console.error("⚠️  Embedding error:", err.message ?? err);
    return null;
  }
}

/** Convierte [0.1,0.2] → `'[0.1,0.2]'` (literal requerido por pgvector) */
function toVectorLiteral(arr) {
  return `'[${arr.join(",")}]'`;
}

/* ---------- Handler ------------------------------------------------- */

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { title, description, requirements, userId, expirationDate } = req.body;
  console.log("➡️  /api/job/create payload:", {
    title,
    description,
    requirements,
    userId,
    expirationDate,
  });

  if (!title || !description || !userId) {
    return res.status(400).json({ message: "Faltan campos obligatorios" });
  }

  /* 1️⃣  Embedding (no detiene la creación si falla) */
  const embText   = `${title}\n\n${description}\n\n${requirements || ""}`;
  const embedding = await getJobEmbedding(embText);

  /* 2️⃣  Inserción principal (sin la columna vector) */
  const created = await prisma.job.create({
    data: {
      title,
      description,
      requirements,
      userId: Number(userId),
      expirationDate: expirationDate ? new Date(expirationDate) : null,
    },
  });

  /* 3️⃣  Si hay embedding => UPDATE separado con SQL crudo */
  if (embedding) {
    const vectorLiteral = toVectorLiteral(embedding);
    await prisma.$executeRawUnsafe(`
      UPDATE "Job"
         SET embedding = ${vectorLiteral}::vector
       WHERE id       = ${created.id};
    `);
  }

  /* 4️⃣  Respuesta */
  return res.status(200).json({ message: "Oferta creada", job: created });
}
