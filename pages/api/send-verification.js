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
    port: Number(process.env.SMTP_PORT),
    secure: Number(process.env.SMTP_PORT) === 465, // true para puerto 465
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  try {
    await transporter.sendMail({
      from: `"No Reply" <no-reply@fapmendoza.com>`,
      to: email,
      subject: "Código de verificación de Fap Mendoza",
      text: `Estimado usuario,

Gracias por registrarse en Fap Mendoza. Para completar su proceso de registro, por favor utilice el siguiente código de verificación:

${code}

Este código es válido por los próximos 15 minutos. Si no ha solicitado este registro, por favor ignore este mensaje.

Atentamente,
El equipo de Fap Mendoza`,
      html: `<p>Estimado usuario,</p>
<p>Gracias por registrarse en <strong>Fap Mendoza</strong>. Para completar su proceso de registro, por favor utilice el siguiente código de verificación:</p>
<h2>${code}</h2>
<p>Este código es válido por los próximos 15 minutos. Si no ha solicitado este registro, por favor ignore este mensaje.</p>
<p>Atentamente,<br/>El equipo de Fap Mendoza</p>`,
    });    
    
    return res.status(200).json({ message: "Correo enviado correctamente" });
  } catch (error) {
    console.error("Error enviando correo:", error);
    return res.status(500).json({ error: "Error enviando correo" });
  }
}
