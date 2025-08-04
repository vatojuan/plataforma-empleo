// pages/api/job/create.js
import prisma from "../../../lib/prisma";
import fetch  from "node-fetch";          // npm i node-fetch (si es Node < 18)

// ───────────────────────── Helpers ──────────────────────────
// Convierte el array float[] que devuelve OpenAI en la sintaxis
// literal de pgvector:  [0.1,0.2,0.3]
function toVectorLiteral(arr) {
  return `[${arr.join(",")}]`;
}

// Llama a la API de OpenAI y devuelve el embedding (o null si falla)
async function getJobEmbedding(text) {
  try {
    const rsp = await fetch("https://api.openai.com/v1/embeddings", {
      method : "POST",
      headers: {
        "Content-Type" : "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model : "text-embedding-ada-002",
        input : text,
      }),
    });

    if (!rsp.ok) {
      throw new Error(await rsp.text());
    }

    const data = await rsp.json();
    return data?.data?.[0]?.embedding ?? null;
  } catch (err) {
    console.error("⚠️  Error generando embedding:", err.message);
    return null;
  }
}

// ───────────────────────── Handler ──────────────────────────
export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  // Campos recibidos desde el frontend
  const { title, description, requirements, userId, expirationDate } = req.body;
  console.log("▶️  /api/job/create payload:", { title, userId, expirationDate });

  if (!title || !description || !userId) {
    return res.status(400).json({ message: "Faltan campos obligatorios" });
  }

  // 1) Generar embedding (no detiene el flujo si falla)
  const embedding = await getJobEmbedding(
    `${title}\n\n${description}\n\n${requirements || ""}`
  );

  // 2) Crear la oferta con Prisma (sin el campo vector)
  let created;
  try {
    created = await prisma.job.create({
      data: {
        title,
        description,
        requirements,
        userId       : Number(userId),
        expirationDate: expirationDate ? new Date(expirationDate) : null,
      },
    });
    console.log("✅  Oferta creada (id:", created.id, ")");
  } catch (err) {
    console.error("❌  Error creando oferta:", err);
    return res.status(500).json({ message: "Error interno al crear oferta" });
  }

  // 3) Insertar el embedding con SQL nativo (solo si existe)
  if (embedding) {
    try {
      await prisma.$executeRawUnsafe(`
        UPDATE "Job"
           SET embedding = '${toVectorLiteral(embedding)}'::vector
         WHERE id = ${created.id};
      `);
      console.log("✅  Embedding guardado en la BD");
    } catch (err) {
      // El embedding falló, pero la oferta ya existe → solo logueamos
      console.error("⚠️  Error guardando embedding:", err.message);
    }
  } else {
    console.warn("⚠️  Se creó la oferta SIN embedding (no habrá matching)");
  }

  return res.status(200).json({ message: "Oferta creada", job: created });
}
