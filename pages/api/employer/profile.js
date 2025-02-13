// pages/api/employer/profile.js
import prisma from '../../../lib/prisma';

export default async function handler(req, res) {
  const employerId = 1; // Para este ejemplo usamos un ID fijo.

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
