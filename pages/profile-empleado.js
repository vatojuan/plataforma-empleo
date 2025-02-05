// pages/profile-empleado.js
import { useState } from "react";
import { useRouter } from "next/router";

export default function ProfileEmpleado() {
  const [nombre, setNombre] = useState("");
  const [curriculum, setCurriculum] = useState(null);
  const router = useRouter();

  const handleFileChange = (e) => {
    setCurriculum(e.target.files[0]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Aquí se simula la actualización del perfil. En el futuro, enviarás el CV y datos al backend.
    alert(`Perfil de empleado actualizado para ${nombre}. (Currículum: ${curriculum ? curriculum.name : "ninguno"})`);
    router.push("/dashboard");
  };

  return (
    <div style={{ textAlign: "center", marginTop: "2rem" }}>
      <h1>Perfil de Empleado</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Nombre Completo:</label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Cargar Currículum (PDF):</label>
          <input type="file" onChange={handleFileChange} accept=".pdf" />
        </div>
        <button type="submit">Actualizar Perfil</button>
      </form>
      <p>
        <a href="/dashboard">Volver al Dashboard</a>
      </p>
    </div>
  );
}
