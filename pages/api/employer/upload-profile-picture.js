import { createRouter } from 'next-connect';
import multer from 'multer';
import path from 'path';
import prisma from '../../../lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';

// Configurar multer para guardar el archivo con su extensión original
const storage = multer.diskStorage({
  destination: './public/uploads/',
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, fileName);
  }
});
const upload = multer({ storage });

const apiRoute = createRouter();

// Middleware de multer para procesar el archivo con campo "profilePicture"
apiRoute.use(upload.single('profilePicture'));

apiRoute.post(async (req, res) => {
  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
      return res.status(401).json({ error: 'No autorizado' });
    }
    const userId = Number(session.user.id);
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: 'No se ha subido ningún archivo.' });
    }
    const fileUrl = `/uploads/${file.filename}`;
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { profilePicture: fileUrl },
    });
    console.log('Imagen de perfil actualizada:', updatedUser);
    return res.status(200).json({ message: 'Imagen de perfil actualizada', user: updatedUser });
  } catch (error) {
    console.error('Error al actualizar la imagen de perfil:', error);
    return res.status(500).json({ error: 'Error al actualizar la imagen de perfil' });
  }
});

export const config = {
  api: { bodyParser: false },
};

export default apiRoute.handler();
