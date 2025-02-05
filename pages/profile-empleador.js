// pages/profile-empleador.js
import { useState } from "react";
import { useRouter } from "next/router";

export default function ProfileEmpleador() {
  const [empresa, setEmpresa] = useState("");
  const [requerimientos, setRequerimientos] = useState("");
  const router = useRouter();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simula la actualización de datos del empleador. En el futuro, se enviarán a un backend.
    alert(`Perfil de empleador actualizado para ${empresa}.\nRequerimientos: ${requerimientos}`);
    router.push("/dashboard");
  };

  return (
    <div style={{ textAlign: "center", marginTop: "2rem" }}>
      <h1>Perfil de Empleador</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Nombre de la Empresa:</label>
          <input
            type="text"
            value={empresa}
            onChange={(e) => setEmpresa(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Requerimientos y Descripción:</label>
          <textarea
            value={requerimientos}
            onChange={(e) => setRequerimientos(e.target.value)}
            required
          />
        </div>
        <button type="submit">Actualizar Perfil</button>
      </form>
      <p>
        <a href="/dashboard">Volver al Dashboard</a>
      </p>
    </div>
  );
}
