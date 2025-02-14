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
    const user = await prisma.user.findUnique({
      where: { id: employeeId },
    });
    
    if (!user || !user.cvUrl) {
      return res.status(404).json({ error: 'No se encontró CV para eliminar' });
    }
    
    // Eliminar el archivo físico (opcional)
    const filePath = path.join(process.cwd(), 'public', user.cvUrl);
    fs.unlink(filePath, (err) => {
      if (err) console.error("Error al eliminar el archivo físico:", err);
    });
    
    // Actualizar el campo cvUrl a null
    const updatedUser = await prisma.user.update({
      where: { id: employeeId },
      data: { cvUrl: null },
    });
    
    return res.status(200).json({ message: 'CV eliminado correctamente', user: updatedUser });
  } catch (error) {
    console.error('Error al eliminar CV:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}

export const config = {
  api: { bodyParser: true },
};
