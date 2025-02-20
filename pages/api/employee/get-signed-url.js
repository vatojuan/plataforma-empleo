// pages/api/employee/get-signed-url.js
import { Storage } from "@google-cloud/storage";

const storage = new Storage({
  projectId: process.env.GCLOUD_PROJECT_ID,
  keyFilename: process.env.GCLOUD_KEYFILE,
});
const bucketName = process.env.GCLOUD_BUCKET;

export default async function handler(req, res) {
  const { fileName } = req.query; // Aquí fileName es en realidad el fileKey almacenado
  if (!fileName) {
    return res.status(400).json({ error: "Falta el parámetro fileName" });
  }
  try {
    const bucket = storage.bucket(bucketName);
    const file = bucket.file(fileName);
    const options = {
      version: "v4",
      action: "read",
      expires: Date.now() + 60 * 60 * 1000, // URL válida por 1 hora
    };
    const [url] = await file.getSignedUrl(options);
    return res.status(200).json({ url });
  } catch (error) {
    console.error("Error generando URL firmada:", error);
    return res.status(500).json({ error: "Error generando URL firmada" });
  }
}
