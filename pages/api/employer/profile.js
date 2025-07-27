// pages/api/employer/profile.js
import prisma from '../../../lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  if (!session || !session.user || !session.user.id) {
    return res.status(401).json({ error: 'No autorizado' });
  }
  const userId = Number(session.user.id);

  // --- Lógica para GET (obtener datos del perfil) ---
  if (req.method === 'GET') {
    console.log(`[API /api/employer/profile] GET: Buscando perfil para el ID: ${userId}`);
    try {
      // **CORRECCIÓN CLAVE EN GET**: Obtenemos datos de ambas tablas relacionadas.
      const userWithProfile = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          name: true, // De la tabla User
          profilePicture: true, // De la tabla User
          employerProfile: { // El perfil específico del empleador
            select: {
              companyName: true,
              description: true,
              phone: true,
            },
          },
        },
      });

      if (!userWithProfile || !userWithProfile.employerProfile) {
        console.warn(`[API /api/employer/profile] Perfil de empleador NO encontrado para el ID: ${userId}`);
        return res.status(404).json({ error: 'Perfil de empleador no encontrado' });
      }
      
      // Combinamos los datos en un solo objeto plano para que el frontend lo consuma fácilmente.
      const responseData = {
        name: userWithProfile.name,
        profilePicture: userWithProfile.profilePicture,
        companyName: userWithProfile.employerProfile.companyName,
        description: userWithProfile.employerProfile.description,
        phone: userWithProfile.employerProfile.phone,
      };

      console.log("[API /api/employer/profile] Perfil encontrado. Datos combinados:", responseData);
      return res.status(200).json(responseData);

    } catch (error) {
      console.error('[API /api/employer/profile] Error en GET:', error);
      return res.status(500).json({ error: 'Error del servidor al obtener el perfil' });
    }
  } 
  // --- Lógica para PUT (actualizar datos del perfil) ---
  else if (req.method === 'PUT') {
    const { name, companyName, description, phone } = req.body;
    console.log(`[API /api/employer/profile] PUT: Actualizando perfil para el ID: ${userId}`);
    console.log("[API /api/employer/profile] Datos recibidos para actualizar:", req.body);

    try {
      // **CORRECCIÓN CLAVE EN PUT**: Usamos una transacción para actualizar ambas tablas de forma segura.
      const [updatedUser, updatedEmployerProfile] = await prisma.$transaction([
        // 1. Actualiza la tabla 'User' con el nombre.
        prisma.user.update({
          where: { id: userId },
          data: { name: name },
        }),
        // 2. Actualiza la tabla 'EmployerProfile' con el resto de los datos.
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
      console.error('[API /api/employer/profile] Error en PUT:', error);
      return res.status(500).json({ error: 'Error al actualizar el perfil' });
    }
  } 
  // --- Manejo de otros métodos HTTP ---
  else {
    res.setHeader('Allow', ['GET', 'PUT']);
    return res.status(405).json({ error: `Método ${req.method} no permitido` });
  }
}
