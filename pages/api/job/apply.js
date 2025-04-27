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
    if (!session) return res.status(401).json({ error: 'No autorizado' });
    const userId = Number(session.user.id);
    const { jobId } = req.body;
    if (!jobId) return res.status(400).json({ error: 'Falta el ID del empleo' });

    // Verificar si ya existe una postulación
    const existingApp = await prisma.application.findFirst({
      where: { userId, jobId: Number(jobId) },
    });
    if (existingApp) {
      return res.status(400).json({ error: 'Ya has postulado a este empleo' });
    }

    // Crear la aplicación en la base de datos
    const application = await prisma.application.create({
      data: { userId, jobId: Number(jobId) },
    });

    // Llamar al endpoint de FastAPI para crear la propuesta
    // Se asume que la propuesta es automática y se crea con status "waiting"
    const fastapiUrl = process.env.FASTAPI_URL; // Asegurate de definir esta variable
    const proposalResponse = await fetch(`${fastapiUrl}/api/proposals/create`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        job_id: Number(jobId),
        applicant_id: userId,
        label: 'automatic'
      })
    });
    if (!proposalResponse.ok) {
      console.error('Error al crear propuesta en FastAPI');
      // Podés decidir qué hacer en caso de error, por ejemplo, cancelar la aplicación
    }
    const proposalData = await proposalResponse.json();

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
