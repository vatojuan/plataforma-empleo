import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useSession, signOut, signIn } from "next-auth/react";
import Link from "next/link";

export default function SelectRole() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState("empleado");

  useEffect(() => {
    if (status !== "loading" && !session) {
      router.push("/login");
    } else if (session && session.user.role) {
      router.push("/dashboard");
    }
  }, [session, status, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch("/api/auth/select-role", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: session.user.email, role: selectedRole }),
    });
    if (res.ok) {
      // Actualizamos la sesión mediante signIn sin proveedor para forzar el refresco
      await signIn(undefined, { callbackUrl: "/dashboard" });
    } else {
      alert("Error al actualizar el rol");
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "2rem" }}>
      <h1>Selecciona tu Rol</h1>
      <p>Elige si eres Empleado o Empleador:</p>
      <form onSubmit={handleSubmit}>
        <select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)}>
          <option value="empleado">Empleado</option>
          <option value="empleador">Empleador</option>
        </select>
        <br /><br />
        <button type="submit">Confirmar Rol</button>
      </form>
      <button onClick={() => signOut({ redirect: true, callbackUrl: "/login" })}>
        Cerrar sesión
      </button>
    </div>
  );
}
