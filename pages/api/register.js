// pages/api/register.js
import clientPromise from "../../lib/mongodb";
import { generarCodigo } from "../../lib/generateCode";
import { hash } from "bcryptjs";
import nodemailer from "nodemailer";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email y contraseña son requeridos" });
  }

  try {
    // Conecta a la base de datos
    const client = await clientPromise;
    const db = client.db(); // Usa la base de datos por defecto o especifica la que necesites

    // Verifica si el usuario ya existe
    const usuarioExistente = await db.collection("users").findOne({ email });
    if (usuarioExistente) {
      return res.status(400).json({ error: "El usuario ya existe" });
    }

    // Genera el código de verificación y establece la expiración (15 minutos)
    const verificationCode = generarCodigo(6);
    const codeExpiration = new Date(Date.now() + 15 * 60 * 1000);

    // Hashea la contraseña
    const hashedPassword = await hash(password, 12);

    // Guarda el usuario en la base de datos
    const nuevoUsuario = {
      email,
      password: hashedPassword,
      verificationCode,
      codeExpiration,
      verified: false,
      createdAt: new Date(),
    };

    await db.collection("users").insertOne(nuevoUsuario);

    // Configura el transporte SMTP usando tus credenciales de Google Workspace
    let transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST, // ej.: smtp.gmail.com
      port: Number(process.env.SMTP_PORT), // ej.: 465
      secure: Number(process.env.SMTP_PORT) === 465, // true si usas puerto 465
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Envía el correo de verificación
    await transporter.sendMail({
      from: `"Tu Empresa" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Código de verificación",
      text: `Utiliza este código para verificar tu correo: ${verificationCode}`,
      html: `<p>Utiliza este código para verificar tu correo: <strong>${verificationCode}</strong></p>`,
    });

    return res.status(200).json({
      message: "Usuario creado y correo de verificación enviado",
    });
  } catch (error) {
    console.error("Error en el registro:", error);
    return res.status(500).json({ error: "Error en el registro" });
  }
}
