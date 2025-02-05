// pages/register.js
import { useState } from "react";
import { useRouter } from "next/router";

export default function Register() {
  const [userType, setUserType] = useState("empleado"); // "empleado" o "empleador"
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Aquí simula el registro: en un futuro, enviarás la info a tu backend
    alert(`Registrado como ${userType}: ${username}`);
    // Redirige a la página de perfil correspondiente según el tipo de usuario
    if (userType === "empleado") {
      router.push("/profile-empleado");
    } else {
      router.push("/profile-empleador");
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "2rem" }}>
      <h1>Registro</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Tipo de Usuario:</label>
          <select value={userType} onChange={(e) => setUserType(e.target.value)}>
            <option value="empleado">Empleado</option>
            <option value="empleador">Empleador</option>
          </select>
        </div>
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
