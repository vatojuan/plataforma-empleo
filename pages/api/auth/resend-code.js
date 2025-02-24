// pages/api/auth/resend-code.js
import { PrismaClient } from '@prisma/client';
import { generarCodigo } from '../../../lib/generateCode';
import nodemailer from 'nodemailer';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: "El correo es requerido" });
  }

  try {
    const usuario = await prisma.user.findUnique({ where: { email } });
    if (!usuario) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }
    if (usuario.verified) {
      return res.status(400).json({ error: "El usuario ya está verificado" });
    }

    // Comprueba si se puede reenviar: deben haber pasado al menos 2 minutos
    if (usuario.lastResend && new Date() - new Date(usuario.lastResend) < 2 * 60 * 1000) {
      return res.status(400).json({ error: "Espera al menos 2 minutos para reenviar el código." });
    }

    // Verifica que no se haya excedido el límite de 3 reenvíos
    if (usuario.resendCount >= 3) {
      return res.status(400).json({ error: "Has excedido el límite de reenvíos. Reinicia el proceso de registro." });
    }

    // Genera un nuevo código y actualiza la expiración (15 minutos)
    const nuevoCodigo = generarCodigo(6);
    const nuevaExpiracion = new Date(Date.now() + 15 * 60 * 1000);

    await prisma.user.update({
      where: { email },
      data: {
        verificationCode: nuevoCodigo,
        codeExpiration: nuevaExpiracion,
        verificationAttempts: 0, // reinicia los intentos
        resendCount: usuario.resendCount + 1,
        lastResend: new Date(),
      },
    });

    // Configura el transporte SMTP
    let transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      tls: Number(process.env.SMTP_PORT) === 587 ? { rejectUnauthorized: false } : undefined,
    });

    // Envía el correo con el nuevo código usando el alias "No Reply"
    await transporter.sendMail({
      from: `"No Reply" <no-reply@fapmendoza.com>`,
      to: email,
      subject: "Nuevo Código de verificación",
      text: `Utiliza este nuevo código para verificar tu correo: ${nuevoCodigo}`,
      html: `<p>Utiliza este nuevo código para verificar tu correo: <strong>${nuevoCodigo}</strong></p>`,
    });

    return res.status(200).json({ message: "Nuevo código enviado correctamente" });
  } catch (error) {
    console.error("Error al reenviar el código:", error);
    return res.status(500).json({ error: "Error al reenviar el código" });
  }
}
