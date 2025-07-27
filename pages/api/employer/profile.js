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
      // **CORRECCIÓN FINAL**: Cambiamos el punto de partida de la consulta.
      
      // 1. Buscamos el perfil del empleador.
      let employerProfile = await prisma.employerProfile.findUnique({
        where: { userId: userId },
      });

      // 2. Si no existe, lo creamos.
      if (!employerProfile) {
        console.warn(`[API /api/employer/profile] Perfil de empleador NO encontrado para ID: ${userId}. Creando uno nuevo...`);
        employerProfile = await prisma.employerProfile.create({
          data: {
            userId: userId,
            companyName: '',
            description: '',
            phone: '',
          }
        });
      }

      // 3. Ahora que sabemos que el perfil existe, lo buscamos de nuevo pero incluyendo los datos del usuario.
      const profileWithUserData = await prisma.employerProfile.findUnique({
        where: { userId: userId },
        include: {
          user: { // Incluimos el usuario relacionado
            select: {
              name: true,
              profilePicture: true,
            }
          }
        }
      });

      if (!profileWithUserData || !profileWithUserData.user) {
         return res.status(404).json({ error: 'No se pudo encontrar el perfil con los datos de usuario.' });
      }

      // 4. Combinamos los datos en un solo objeto plano para el frontend.
      const responseData = {
        name: profileWithUserData.user.name || '',
        profilePicture: profileWithUserData.user.profilePicture || null,
        companyName: profileWithUserData.companyName || '',
        description: profileWithUserData.description || '',
        phone: profileWithUserData.phone || '',
      };

      console.log("[API /api/employer/profile] Perfil encontrado/creado. Datos combinados:", responseData);
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

    try {
      // La lógica de la transacción sigue siendo correcta y robusta.
      const [updatedUser, updatedEmployerProfile] = await prisma.$transaction([
        prisma.user.update({
          where: { id: userId },
          data: { name: name },
        }),
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
