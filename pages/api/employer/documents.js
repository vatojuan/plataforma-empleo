// pages/api/employer/documents.js
import { createRouter } from 'next-connect';
import prisma from '../../../lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';

const apiRoute = createRouter();

apiRoute.get(async (req, res) => {
  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
      return res.status(401).json({ error: 'No autorizado' });
    }
    const userId = Number(session.user.id);
    const documents = await prisma.legalDocument.findMany({
      where: { userId },
    });
    return res.status(200).json({ documents });
  } catch (error) {
    console.error('Error al obtener documentos:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export const config = {
  api: { bodyParser: true },
};

export default apiRoute.handler();
