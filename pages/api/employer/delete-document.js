// pages/api/employer/delete-document.js
import { createRouter } from 'next-connect';
import fs from 'fs';
import path from 'path';
import prisma from '../../../lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';

const apiRoute = createRouter();

apiRoute.delete(async (req, res) => {
  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
      return res.status(401).json({ error: 'No autorizado' });
    }
    const userId = Number(session.user.id);
    const { documentId } = req.body;
    if (!documentId) {
      return res.status(400).json({ error: 'No se proporcionó el ID del documento' });
    }

    // Buscar el documento y asegurarse de que pertenezca al usuario
    const document = await prisma.legalDocument.findUnique({
      where: { id: Number(documentId) },
    });
    if (!document || document.userId !== userId) {
      return res.status(404).json({ error: 'Documento no encontrado' });
    }

    // Eliminar el archivo físico (opcional)
    const filePath = path.join(process.cwd(), 'public', document.url);
    fs.unlink(filePath, (err) => {
      if (err) console.error("Error al eliminar el archivo:", err);
    });

    // Eliminar el registro de la base de datos
    const deletedDocument = await prisma.legalDocument.delete({
      where: { id: Number(documentId) },
    });

    return res.status(200).json({ message: 'Documento eliminado', document: deletedDocument });
  } catch (error) {
    console.error("Error al eliminar documento:", error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export const config = {
  api: { bodyParser: true },
};

export default apiRoute.handler();
