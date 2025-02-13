import { createRouter } from 'next-connect';
import multer from 'multer';
import path from 'path';
import prisma from '../../../lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';

// Configurar almacenamiento de Multer para guardar el archivo con su extensión original
const storage = multer.diskStorage({
  destination: './public/uploads/',
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname); // obtiene la extensión original, por ejemplo, .pdf
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

// Creamos el router usando createRouter de next-connect
const apiRoute = createRouter();

// Aplicamos el middleware de Multer
apiRoute.use(upload.single('document'));

apiRoute.post(async (req, res) => {
  try {
    // Obtenemos la sesión del usuario
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
      return res.status(401).json({ error: 'No autorizado' });
    }

    const employerId = Number(session.user.id);
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: 'No se ha subido ningún archivo.' });
    }

    // Construir la URL del archivo
    const fileUrl = `/uploads/${file.filename}`;

    // Guardar la información del documento en la base de datos
    const legalDocument = await prisma.legalDocument.create({
      data: { url: fileUrl, userId: employerId },
    });

    console.log('Documento guardado en la base de datos:', legalDocument);
    return res.status(200).json({ message: 'Documento subido correctamente', document: legalDocument });
  } catch (error) {
    console.error('Error en upload-document:', error);
    return res.status(500).json({ error: 'Error al subir el documento' });
  }
});

export const config = {
  api: { bodyParser: false }, // Deshabilitar el body parser para manejar multipart/form-data
};

export default apiRoute.handler();
