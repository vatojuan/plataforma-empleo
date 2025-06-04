// pages/api/job/apply.js

import prisma from '../../../lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Método ${req.method} no permitido` });
  }

  try {
    // 1) Obtener sesión NextAuth para saber quién es el userId
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
      return res.status(401).json({ error: 'No autorizado' });
    }
    const userId = Number(session.user.id);

    // 2) Extraer jobId del body
    const { jobId } = req.body;
    if (!jobId) {
      return res.status(400).json({ error: 'Falta el ID del empleo' });
    }

    // 3) Verificar si ya existe una postulación local (Prisma)
    const existingApp = await prisma.application.findFirst({
      where: { userId, jobId: Number(jobId) },
    });
    if (existingApp) {
      return res.status(400).json({ error: 'Ya has postulado a este empleo' });
    }

    // 4) Crear la aplicación en la base de datos local con Prisma
    const application = await prisma.application.create({
      data: { userId, jobId: Number(jobId) },
    });

    // 5) Llamar al endpoint de FastAPI para crear la propuesta remota
    const fastapiUrl = process.env.NEXT_PUBLIC_API_URL || process.env.FASTAPI_URL;
    // Para FastAPI, usamos el mismo token de NextAuth (requiere que hayas guardado adminToken en cookies)
    const adminToken = req.cookies.adminToken;
    const proposalResponse = await fetch(
      `${fastapiUrl}/api/proposals/create`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(adminToken ? { Authorization: `Bearer ${adminToken}` } : {}),
        },
        body: JSON.stringify({
          job_id: Number(jobId),
          applicant_id: userId,
          label: 'automatic',
        }),
      }
    );

    let proposalData = null;
    if (proposalResponse.ok) {
      proposalData = await proposalResponse.json().catch(() => null);
    } else {
      console.error(
        'Error al crear propuesta en FastAPI:',
        await proposalResponse.text()
      );
    }

    return res.status(200).json({
      message: 'Postulación exitosa',
      application,
      proposal: proposalData,
    });
  } catch (error) {
    console.error('Error al postular:', error);
    return res.status(500).json({ error: 'Error al postular' });
  }
}
