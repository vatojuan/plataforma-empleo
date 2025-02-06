// pages/api/auth/register.js
import prisma from "../../../lib/prisma";
import bcrypt from "bcryptjs";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { email, name, password, role } = req.body;
  if (!email || !name || !password || !role) {
    return res.status(400).json({ message: "Faltan campos obligatorios" });
  }

  try {
    // Verifica si el usuario ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      return res.status(400).json({ message: "El usuario ya existe" });
    }

    // Hashea la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crea el usuario con confirmed = false (pendiente de confirmar)
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role,
        confirmed: false,
      },
    });

    // Simula el envío de un correo de confirmación
    console.log("Simula envío de correo de confirmación a", email);

    return res.status(200).json({
      message:
        "Registro exitoso. Revisa tu correo para confirmar tu cuenta (simulado).",
    });
  } catch (error) {
    console.error("Error en el registro:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
}
