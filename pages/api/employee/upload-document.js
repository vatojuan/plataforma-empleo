// pages/api/employee/upload-document.js
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
    const employeeId = Number(session.user.id);
    const file = req.file;
    if (!file) return res.status(400).json({ error: 'No se ha subido ningún archivo.' });

    const ext = path.extname(file.originalname);
    const destination = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    const fileUrl = await uploadFile(file.buffer, destination, file.mimetype);

    const document = await prisma.employeeDocument.create({
      data: {
        url: fileUrl,
        originalName: file.originalname, // almacena el nombre original
        userId: employeeId,
      },
    });
    console.log('CV subido:', document);
    return res.status(200).json({ message: 'Documento subido correctamente', document });
  } catch (error) {
    console.error('Error subiendo el documento:', error);
    return res.status(500).json({ error: 'Error al subir el documento' });
  }
});

export const config = {
  api: { bodyParser: false },
};

export default apiRoute.handler();
