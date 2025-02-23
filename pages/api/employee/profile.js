import prisma from '../../../lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ error: 'No autorizado' });
  }
  const employeeId = Number(session.user.id);

  if (req.method === 'GET') {
    try {
      // Se seleccionan los campos que necesitas, incluyendo profilePicture
      const employeeProfile = await prisma.user.findUnique({
        where: { id: employeeId },
        select: {
          id: true,
          name: true,
          phone: true,
          description: true,
          profilePicture: true, // Asegúrate de que este campo exista en tu schema
          // puedes incluir otros campos que necesites
        },
      });
      if (!employeeProfile) {
        return res.status(404).json({ error: 'Perfil no encontrado' });
      }
      return res.status(200).json(employeeProfile);
    } catch (error) {
      console.error('Error obteniendo el perfil:', error);
      return res.status(500).json({ error: 'Error del servidor al obtener el perfil' });
    }
  } else if (req.method === 'PUT') {
    const { name, phone, description } = req.body;
    try {
      const updatedProfile = await prisma.user.update({
        where: { id: employeeId },
        data: { name, phone, description },
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
