// pages/api/job/cancel-application.js
import prisma from '../../../lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';

export default async function handler(req, res) {
  if (req.method !== 'DELETE') {
    res.setHeader('Allow', ['DELETE']);
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
    // Eliminar la postulación del usuario para el empleo dado
    const deleted = await prisma.application.deleteMany({
      where: { userId, jobId: Number(jobId) },
    });
    return res.status(200).json({ message: 'Postulación cancelada', deleted });
  } catch (error) {
    console.error('Error al cancelar postulación:', error);
    return res.status(500).json({ error: 'Error al cancelar postulación' });
  }
}
