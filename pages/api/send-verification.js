// pages/api/send-verification.js
import nodemailer from "nodemailer";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).end("Método no permitido");
  }
  
  const { email, code } = req.body;
  
  // Configura el transporte SMTP usando tus credenciales de Google Workspace
  let transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST, 
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_PORT == 465, // true para puerto 465
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  try {
    await transporter.sendMail({
      from: `"Tu Empresa" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Código de verificación",
      text: `Utiliza este código para verificar tu correo: ${code}`,
      html: `<p>Utiliza este código para verificar tu correo: <strong>${code}</strong></p>`,
    });
    return res.status(200).json({ message: "Correo enviado correctamente" });
  } catch (error) {
    console.error("Error enviando correo:", error);
    return res.status(500).json({ error: "Error enviando correo" });
  }
}
