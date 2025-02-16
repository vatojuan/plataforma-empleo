// pages/api/employer/upload-document.js
import { createRouter } from 'next-connect';
import multer from 'multer';
import prisma from '../../../lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { uploadFile } from '../../../lib/gcs';
import path from 'path';

const storage = multer.memoryStorage();
const upload = multer({ storage });
const apiRoute = createRouter();

apiRoute.use(upload.single('document'));

apiRoute.post(async (req, res) => {
  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session) return res.status(401).json({ error: 'No autorizado' });
    const employerId = Number(session.user.id);
    const file = req.file;
    if (!file) return res.status(400).json({ error: 'No se ha subido ningún archivo.' });

    const ext = path.extname(file.originalname);
    const destination = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    const fileUrl = await uploadFile(file.buffer, destination, file.mimetype);

    // Guardar el documento incluyendo el nombre original
    const document = await prisma.legalDocument.create({
      data: {
        url: fileUrl,
        originalName: file.originalname, // se almacena el nombre original
        userId: employerId,
      },
    });
    console.log('Documento legal subido:', document);
    return res.status(200).json({ message: 'Documento legal subido correctamente', document });
  } catch (error) {
    console.error('Error subiendo el documento legal:', error);
    return res.status(500).json({ error: 'Error al subir el documento legal' });
  }
});

export const config = {
  api: { bodyParser: false },
};

export default apiRoute.handler();
