import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import prisma from '../../../lib/prisma';
import fs from 'fs';
import path from 'path';

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
    const employeeId = Number(session.user.id);
    const { documentId } = req.body;
    if (!documentId) {
      return res.status(400).json({ error: 'Falta el ID del documento' });
    }
    
    // Buscar el documento y verificar que pertenezca al usuario
    const doc = await prisma.employeeDocument.findUnique({
      where: { id: Number(documentId) },
    });
    if (!doc || doc.userId !== employeeId) {
      return res.status(404).json({ error: 'Documento no encontrado' });
    }
    
    // Eliminar el archivo físico (opcional)
    const filePath = path.join(process.cwd(), 'public', doc.url);
    fs.unlink(filePath, (err) => {
      if (err) console.error("Error al eliminar el archivo físico:", err);
    });
    
    // Eliminar el registro en la base de datos
    await prisma.employeeDocument.delete({
      where: { id: Number(documentId) },
    });
    
    return res.status(200).json({ message: 'Documento eliminado correctamente' });
  } catch (error) {
    console.error('Error eliminando el documento:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}

export const config = {
  api: { bodyParser: true },
};
