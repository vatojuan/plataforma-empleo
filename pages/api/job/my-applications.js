// pages/api/job/my-applications.js
import prisma from '../../../lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';

export default async function handler(req, res) {
  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session) return res.status(401).json({ error: 'No autorizado' });
    const userId = Number(session.user.id);
    const applications = await prisma.application.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { job: true }, // Incluye los detalles del empleo
    });
    return res.status(200).json({ applications });
  } catch (error) {
    console.error("Error fetching applications:", error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}
