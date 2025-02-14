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

apiRoute.use(upload.single('document'));

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
    // Guardar el documento en la tabla EmployeeDocument
    const document = await prisma.employeeDocument.create({
      data: {
        url: fileUrl,
        userId: employeeId,
      },
    });
    console.log('Documento subido:', document);
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
