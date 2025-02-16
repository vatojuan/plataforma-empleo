// pages/api/job/delete.js
import prisma from '../../../lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';

export default async function handler(req, res) {
  if (req.method !== 'DELETE') {
    res.setHeader('Allow', ['DELETE']);
    return res.status(405).json({ error: `Método ${req.method} no permitido` });
  }

  // Obtener la sesión del usuario
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ error: 'No autorizado' });
  }

  // Asegurarse de que se envíe el jobId en el body
  const { jobId } = req.body || {};
  if (!jobId) {
    return res.status(400).json({ error: 'No se proporcionó el jobId' });
  }

  try {
    // Eliminar la oferta de empleo correspondiente
    const deletedJob = await prisma.job.delete({
      where: { id: Number(jobId) },
    });
    return res.status(200).json({ message: 'Oferta eliminada correctamente', deletedJob });
  } catch (error) {
    console.error('Error eliminando la oferta:', error);
    return res.status(500).json({ error: 'Error al eliminar la oferta' });
  }
}

export const config = {
  api: {
    bodyParser: true, // Para que Next.js procese el JSON del body en DELETE
  },
};
