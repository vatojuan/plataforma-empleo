// pages/api/employer/profile.js
import prisma from '../../../lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';

export default async function handler(req, res) {
  // Obtener la sesión de forma segura en el servidor
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ error: 'No autorizado' });
  }

  // Convertir el ID a número (ya que en el esquema User, id es Int)
  const employerId = Number(session.user.id);

  if (req.method === 'GET') {
    try {
      const employerProfile = await prisma.user.findUnique({
        where: { id: employerId },
      });

      if (!employerProfile) {
        return res.status(404).json({ error: 'Perfil no encontrado' });
      }

      return res.status(200).json(employerProfile);
    } catch (error) {
      console.error('Error obteniendo el perfil:', error);
      return res.status(500).json({ error: 'Error del servidor al obtener el perfil' });
    }
  } else if (req.method === 'PUT') {
    // Validar que se reciba un payload válido
    if (!req.body || typeof req.body !== 'object') {
      return res.status(400).json({ error: 'No se proporcionó un payload válido' });
    }

    const { companyName, description, phone } = req.body;
    try {
      const updatedProfile = await prisma.user.update({
        where: { id: employerId },
        data: { companyName, description, phone },
      });
      return res.status(200).json(updatedProfile);
    } catch (error) {
      console.error('Error actualizando el perfil:', error);
      return res.status(500).json({ error: 'Error al actualizar el perfil' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'PUT']);
    return res.status(405).json({ error: `Método ${req.method} no permitido` });
  }
}
