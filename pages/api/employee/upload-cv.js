import { createRouter } from 'next-connect';
import multer from 'multer';
import path from 'path';
import prisma from '../../../lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';

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

apiRoute.use(upload.single('cv'));

apiRoute.post(async (req, res) => {
  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
      return res.status(401).json({ error: 'No autorizado' });
    }
    const employeeId = Number(session.user.id);
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: 'No se ha subido ningún archivo.' });
    }
    const fileUrl = `/uploads/${file.filename}`;
    // Guardamos el CV en el campo cvUrl del usuario
    const updatedUser = await prisma.user.update({
      where: { id: employeeId },
      data: { cvUrl: fileUrl },
    });
    console.log('CV actualizado:', updatedUser);
    return res.status(200).json({ message: 'CV actualizado', cv: fileUrl });
  } catch (error) {
    console.error('Error al actualizar el CV:', error);
    return res.status(500).json({ error: 'Error al actualizar el CV' });
  }
});

export const config = {
  api: { bodyParser: false },
};

export default apiRoute.handler();
