// pages/profile-empleador.js
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";

export default function ProfileEmpleador() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Estados para los campos del perfil del empleador
  const [companyName, setCompanyName] = useState("");
  const [description, setDescription] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  // Cargar el perfil del empleador al tener la sesión
  useEffect(() => {
    if (session) {
      axios
        .get("/api/employer/profile")
        .then((res) => {
          const data = res.data;
          setCompanyName(data.companyName || "");
          setDescription(data.description || "");
          setPhone(data.phone || "");
        })
        .catch((err) => {
          console.error("Error al cargar el perfil del empleador:", err);
        });
    }
  }, [session]);

  // Si la sesión está cargando, mostramos un mensaje
  if (status === "loading") {
    return <p>Cargando...</p>;
  }
  // Si no hay sesión, redirigimos al login
  if (!session) {
    useEffect(() => {
      router.push("/login");
    }, [router]);
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.put("/api/employer/profile", {
        companyName,
        description,
        phone,
      });
      alert("Perfil actualizado exitosamente");
      // Redirigimos al dashboard después de actualizar
      router.push("/dashboard");
    } catch (error) {
      console.error("Error actualizando el perfil:", error);
      alert("Error actualizando el perfil");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "2rem" }}>
      <h1>Perfil de Empleador</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Nombre de la Empresa:</label>
          <input
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
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
        <div>
          <label>Teléfono:</label>
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? "Actualizando..." : "Actualizar Perfil"}
        </button>
      </form>
      <p>
        {/* Utilizando el componente Link de Next.js sin etiqueta <a> adicional */}
        <Link href="/dashboard">Volver al Dashboard</Link>
      </p>
      <p>
        <button onClick={() => signOut({ callbackUrl: "/login" })}>
          Cerrar sesión
        </button>
      </p>
    </div>
  );
}
