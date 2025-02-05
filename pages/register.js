// pages/register.js
import { useState } from "react";
import { useRouter } from "next/router";

export default function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Aquí puedes simular el registro o integrar con tu backend
    // Por ahora, simplemente redirige a login
    alert("Registro simulado. Por favor, inicia sesión.");
    router.push("/login");
  };

  return (
    <div style={{ textAlign: "center", marginTop: "2rem" }}>
      <h1>Registro</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Usuario:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Contraseña:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Registrarse</button>
      </form>
      <p>
        ¿Ya tienes cuenta? <a href="/login">Inicia sesión</a>
      </p>
    </div>
  );
}
