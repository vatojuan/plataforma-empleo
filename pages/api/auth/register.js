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
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "El usuario ya existe" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role,
        confirmed: false, // En un flujo real, se enviaría un correo para confirmar
      },
    });

    return res.status(200).json({ message: "Usuario registrado. Revisa tu correo para confirmar la cuenta." });
  } catch (error) {
    console.error("Error en registro:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
}
