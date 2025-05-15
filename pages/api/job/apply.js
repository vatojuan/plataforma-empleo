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
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
      return res.status(401).json({ error: 'No autorizado' });
    }

    const userId = Number(session.user.id);
    const { jobId } = req.body;
    if (!jobId) {
      return res.status(400).json({ error: 'Falta el ID del empleo' });
    }

    // 1) Verificar si ya existe una postulación
    const existingApp = await prisma.application.findFirst({
      where: { userId, jobId: Number(jobId) },
    });
    if (existingApp) {
      return res.status(400).json({ error: 'Ya has postulado a este empleo' });
    }

    // 2) Crear la aplicación en la base de datos local
    const application = await prisma.application.create({
      data: { userId, jobId: Number(jobId) },
    });

    // 3) Llamar al endpoint de FastAPI para crear la propuesta
    const fastapiUrl = process.env.NEXT_PUBLIC_API_URL || process.env.FASTAPI_URL;
    const adminToken = req.cookies.adminToken; // o ajusta según donde lo guardes

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

    if (!proposalResponse.ok) {
      console.error(
        'Error al crear propuesta en FastAPI:',
        await proposalResponse.text()
      );
    }
    const proposalData = await proposalResponse.json().catch(() => null);

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
