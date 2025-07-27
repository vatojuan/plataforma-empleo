// pages/api/employer/profile.js
import prisma from '../../../lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ error: 'No autorizado' });
  }
  const userId = Number(session.user.id);

  // --- Lógica para GET (obtener datos) ---
  if (req.method === 'GET') {
    try {
      const employerProfile = await prisma.employerProfile.findUnique({
        where: { userId: userId },
        include: {
          user: { // Incluimos los datos del usuario principal
            select: {
              name: true,
              profilePicture: true,
            },
          },
        },
      });

      if (!employerProfile) {
        return res.status(404).json({ error: 'Perfil de empleador no encontrado' });
      }
      
      // Combinamos los datos para una respuesta más sencilla en el frontend
      const responseData = {
        name: employerProfile.user.name,
        profilePicture: employerProfile.user.profilePicture,
        companyName: employerProfile.companyName,
        description: employerProfile.description,
        phone: employerProfile.phone,
      };

      return res.status(200).json(responseData);
    } catch (error) {
      console.error('Error obteniendo el perfil del empleador:', error);
      return res.status(500).json({ error: 'Error del servidor' });
    }
  } 
  // --- Lógica para PUT (actualizar datos) ---
  else if (req.method === 'PUT') {
    const { name, companyName, description, phone } = req.body;

    try {
      // Usamos una transacción para asegurar que ambas tablas se actualicen
      const [updatedUser, updatedEmployerProfile] = await prisma.$transaction([
        // 1. Actualiza la tabla 'User' con el nombre. ¡Este es el paso clave!
        prisma.user.update({
          where: { id: userId },
          data: { name: name },
        }),
        // 2. Actualiza la tabla 'EmployerProfile' con el resto de los datos
        prisma.employerProfile.update({
          where: { userId: userId },
          data: {
            companyName,
            description,
            phone,
          },
        }),
      ]);

      console.log(`✅ Perfil de usuario y empleador actualizado para ${userId}`);
      return res.status(200).json({ user: updatedUser, profile: updatedEmployerProfile });

    } catch (error) {
      console.error('Error actualizando el perfil del empleador:', error);
      return res.status(500).json({ error: 'Error al actualizar el perfil' });
    }
  } 
  // --- Manejo de otros métodos ---
  else {
    res.setHeader('Allow', ['GET', 'PUT']);
    return res.status(405).json({ error: `Método ${req.method} no permitido` });
  }
}
