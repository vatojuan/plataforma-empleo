import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import prisma from '../../../lib/prisma';

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
      return res.status(400).json({ error: 'Falta el ID de la oferta' });
    }

    // Buscar la oferta y verificar que pertenezca al usuario
    const job = await prisma.job.findUnique({
      where: { id: Number(jobId) },
    });
    if (!job || job.userId !== userId) {
      return res.status(404).json({ error: 'Oferta no encontrada' });
    }

    await prisma.job.delete({
      where: { id: Number(jobId) },
    });

    return res.status(200).json({ message: 'Oferta eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar oferta:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}

export const config = {
  api: { bodyParser: true },
};
