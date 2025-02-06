// pages/select-role.js
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useSession, signOut, signIn } from "next-auth/react";

export default function SelectRole() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState("empleado");

  // Si la sesión aún está cargando, muestra un indicador
  if (status === "loading") return <p>Cargando...</p>;

  // Si no hay sesión, redirige a /login
  useEffect(() => {
    if (!session) {
      router.push("/login");
    }
  }, [session, router]);

  // Si el usuario ya tiene un rol, redirige al Dashboard
  useEffect(() => {
    if (session && session.user.role) {
      router.push("/dashboard");
    }
  }, [session, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch("/api/auth/select-role", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: session.user.email, role: selectedRole }),
    });
    if (res.ok) {
      // Para forzar la actualización de la sesión, primero cerramos la sesión
      await signOut({ redirect: false });
      // Luego, iniciamos sesión nuevamente con Google (esto crea una nueva sesión con los datos actualizados)
      await signIn("google", { callbackUrl: "/dashboard" });
    } else {
      alert("Error al actualizar el rol");
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "2rem" }}>
      <h1>Selecciona tu Rol</h1>
      <p>Por favor, elige si eres Empleado o Empleador:</p>
      <form onSubmit={handleSubmit}>
        <select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)}>
          <option value="empleado">Empleado</option>
          <option value="empleador">Empleador</option>
        </select>
        <br /><br />
        <button type="submit">Confirmar Rol</button>
      </form>
      <p>
        Si deseas cerrar sesión,{" "}
        <button onClick={() => signOut({ callbackUrl: "/login" })}>Cerrar Sesión</button>
      </p>
    </div>
  );
}
