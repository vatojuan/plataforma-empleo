// pages/api/verify-code.js
export default async function handler(req, res) {
    if (req.method !== "POST") {
      return res.status(405).end("Método no permitido");
    }
    
    const { email, code } = req.body;
    
    // Busca el usuario en la base de datos (ejemplo usando pseudo-código)
    const usuario = await db.usuarios.findOne({ email });
    if (!usuario) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }
    
    // Comprueba que el código coincida y que no haya expirado
    if (usuario.verificationCode === code && new Date() < new Date(usuario.codeExpiration)) {
      // Marca al usuario como verificado
      await db.usuarios.update({ email }, { verified: true });
      return res.status(200).json({ message: "Correo verificado exitosamente" });
    } else {
      return res.status(400).json({ error: "Código incorrecto o expirado" });
    }
  }
  