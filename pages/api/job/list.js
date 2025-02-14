import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import prisma from '../../../lib/prisma';

export default async function handler(req, res) {
  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
      return res.status(401).json({ error: 'No autorizado' });
    }

    let jobs;
    // Si se pasa userId en la query (para empleadores) se filtra, 
    // de lo contrario (para empleados) se muestran todas las ofertas.
    if (req.query.userId) {
      jobs = await prisma.job.findMany({
        where: { userId: Number(req.query.userId) },
        include: { user: true },
        orderBy: { createdAt: 'desc' },
      });
    } else {
      jobs = await prisma.job.findMany({
        include: { user: true },
        orderBy: { createdAt: 'desc' },
      });
    }

    return res.status(200).json({ jobs });
  } catch (error) {
    console.error("Error fetching jobs:", error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}
