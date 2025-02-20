// pages/api/employee/upload-document.js
<<<<<<< HEAD
import { Storage } from "@google-cloud/storage";
import prisma from "../../../lib/prisma"; // Verifica que prisma está correctamente importado
import { IncomingForm } from "formidable";
import fs from "fs";
=======
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
>>>>>>> 23938c6 (Commit sibida de archivos a google y bugs del perfil)

export const config = {
  api: {
    bodyParser: false, // Desactivar el bodyParser para manejar archivos correctamente
  },
};

const storage = new Storage({
  projectId: process.env.GCLOUD_PROJECT_ID,
  keyFilename: process.env.GCLOUD_KEYFILE,
});

const bucketName = process.env.GCLOUD_BUCKET;
console.log("Bucket Name:", bucketName);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  if (!bucketName) {
    return res.status(500).json({ error: "No se encontró el nombre del bucket en las variables de entorno." });
  }

  const form = new IncomingForm();

  try {
    const { fields, files } = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        else resolve({ fields, files });
      });
    });

    console.log("Fields:", fields);
    console.log("Files:", files.document);

    if (!files.document) {
      return res.status(400).json({ error: "No se encontró el archivo" });
    }

    const uploadedFile = Array.isArray(files.document) ? files.document[0] : files.document;
    console.log("Uploaded file:", uploadedFile);

    if (!uploadedFile.filepath) {
      return res.status(500).json({ error: "Error: La ruta del archivo está vacía." });
    }

    console.log("Ruta del archivo:", uploadedFile.filepath);

    // Genera un nombre único para el archivo
    const fileKey = `employee-documents/${Date.now()}_${uploadedFile.originalFilename || "archivo_sin_nombre"}`;
    console.log(`Subiendo archivo ${fileKey} al bucket ${bucketName}`);

    const bucket = storage.bucket(bucketName);
    const file = bucket.file(fileKey);

    // Convertir el archivo a Stream en lugar de Buffer
    const fileStream = fs.createReadStream(uploadedFile.filepath);

    // Subir el archivo a Google Cloud Storage usando createWriteStream()
    await new Promise((resolve, reject) => {
      const writeStream = file.createWriteStream({
        resumable: false,
        contentType: uploadedFile.mimetype,
      });

      writeStream.on("finish", () => {
        console.log("✅ Archivo subido exitosamente a Google Cloud Storage");
        resolve();
      });

      writeStream.on("error", (err) => {
        console.error("❌ Error en writeStream:", err);
        reject(err);
      });

      fileStream.pipe(writeStream);
    });

    // Validaciones antes de guardar en la base de datos
    const userId = Number(fields.userId) || 1; // Asegura que userId no sea null
    const originalName = uploadedFile.originalFilename || "archivo_sin_nombre";

    console.log("📌 Verificando datos antes de la inserción en BD:");
    console.log(`🔹 fileKey: ${fileKey}`);
    console.log(`🔹 originalName: ${originalName}`);
    console.log(`🔹 userId: ${userId}`);

    console.log("💾 Verificando conexión con Prisma...");
    
    // Prueba simple de conexión con Prisma
    try {
      const testQuery = await prisma.user.findFirst();
      console.log("✅ Conexión con Prisma exitosa:", testQuery);
    } catch (dbTestError) {
      console.error("❌ Error al probar la conexión con Prisma:", dbTestError);
      return res.status(500).json({
        error: "Error al conectar con la base de datos",
        details: dbTestError.message,
      });
    }

    console.log("💾 Insertando en la base de datos...");

    // Guarda el documento en la base de datos con manejo de errores detallado
    try {
      const newDocument = await prisma.employeeDocument.create({
        data: {
          url: "", // Se generará la URL on-demand
          fileKey: fileKey,
          originalName: originalName,
          userId: userId,
        },
      });

      console.log("✅ Documento guardado en la base de datos:", newDocument);
      return res.status(200).json({ document: newDocument });

    } catch (dbError) {
      console.error("❌ Error en la base de datos:", dbError);
      return res.status(500).json({
        error: "Error al insertar en la base de datos",
        details: dbError.message,
      });
    }

  } catch (error) {
    console.error("❌ Error general en la subida de documento:", error);
    return res.status(500).json({
      error: "Error subiendo el documento",
      details: error.message,
    });
  }
}
