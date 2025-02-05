// pages/profile.js
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function Profile() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [name, setName] = useState(session?.user?.name || "");

  // Si la sesión está cargando, muestra "Cargando..."
  if (status === "loading") {
    return <p>Cargando...</p>;
  }

  // Si no hay sesión, redirige al login.
  if (!session) {
    useEffect(() => {
      router.push("/login");
    }, [router]);
    return null;
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    // Aquí se simula la actualización del perfil.
    alert(`Perfil actualizado para: ${name}`);
  };

  return (
    <div style={{ textAlign: "center", marginTop: "2rem" }}>
      <h1>Perfil de Usuario</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Nombre:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <button type="submit">Actualizar Perfil</button>
      </form>
      <p>
        <a href="/dashboard">Volver al Dashboard</a>
      </p>
      <p>
        <button onClick={() => signOut({ callbackUrl: "/login" })}>
          Cerrar sesión
        </button>
      </p>
    </div>
  );
}
