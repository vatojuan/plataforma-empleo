// pages/job-create.js
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import Link from "next/link";

export default function JobCreate() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  // Mientras se carga la sesión
  if (status === "loading") return <p>Cargando...</p>;

  // Si el usuario no está autenticado, redirige al login
  if (!session) {
    router.push("/login");
    return null;
  }

  // Solo los usuarios con rol "empleador" pueden publicar ofertas
  if (session.user.role !== "empleador") {
    return (
      <div style={{ textAlign: "center", marginTop: "2rem" }}>
        <h1>Acceso Denegado</h1>
        <p>Solo los empleadores pueden publicar ofertas de empleo.</p>
        <p>
          <Link href="/dashboard">Volver al Dashboard</Link>
        </p>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    // Envía una solicitud POST a tu endpoint API para crear la oferta.
    const res = await fetch("/api/job/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        description,
        userId: session.user.id, // Se asume que el id es una cadena o número que coincide con el campo en la base de datos.
      }),
    });
    setLoading(false);
    if (res.ok) {
      router.push("/job-list"); // Redirige a la lista de ofertas tras publicar exitosamente.
    } else {
      alert("Error al publicar la oferta");
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "2rem" }}>
      <h1>Publicar Oferta de Empleo</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Título:</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div style={{ marginTop: "1rem" }}>
          <label>Descripción:</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows={4}
            style={{ width: "300px" }}
          ></textarea>
        </div>
        <div style={{ marginTop: "1rem" }}>
          <button type="submit" disabled={loading}>
            {loading ? "Publicando..." : "Publicar Oferta"}
          </button>
        </div>
      </form>
      <p style={{ marginTop: "1rem" }}>
        <Link href="/dashboard">Volver al Dashboard</Link>
      </p>
    </div>
  );
}
