// pages/api/employer/delete-document.js
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
    if (!session) return res.status(401).json({ error: 'No autorizado' });
    const employerId = Number(session.user.id);
    const { documentId } = req.body;
    const document = await prisma.legalDocument.findUnique({ where: { id: documentId } });
    if (!document || document.userId !== employerId) {
      return res.status(404).json({ error: 'Documento no encontrado' });
    }
    await prisma.legalDocument.delete({ where: { id: documentId } });
    return res.status(200).json({ message: 'Documento eliminado correctamente' });
  } catch (error) {
    console.error("Error eliminando el documento:", error);
    return res.status(500).json({ error: 'Error interno al eliminar el documento' });
  }
}
