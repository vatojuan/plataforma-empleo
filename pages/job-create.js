// pages/job-create.js
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";

export default function JobCreate() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (status !== "loading" && !session) {
      router.push("/login");
    } else if (session && !session.user.role) {
      router.push("/select-role");
    }
  }, [session, status, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Se usa el id del usuario de la sesión
    if (!session.user.id) {
      alert("No se encontró el id del usuario. Inicia sesión de nuevo.");
      return;
    }
    const res = await fetch("/api/job/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        description,
        userId: session.user.id
      }),
    });
    if (res.ok) {
      alert("Oferta publicada");
      router.push("/job-list");
    } else {
      const data = await res.json();
      alert("Error al publicar oferta: " + data.message);
    }
  };

  if (status === "loading" || !session) {
    return <p>Cargando...</p>;
  }

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
        <div>
          <label>Descripción:</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          ></textarea>
        </div>
        <button type="submit">Publicar Oferta</button>
      </form>
    </div>
  );
}
