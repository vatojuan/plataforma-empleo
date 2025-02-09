// pages/login.js
import { signIn } from "next-auth/react";

export default function Login() {
  const handleGoogleLogin = () => {
    signIn("google", { callbackUrl: "/dashboard" });
  };

  return (
    <div style={{ textAlign: "center", marginTop: "2rem" }}>
      <h1>Iniciar Sesión</h1>
      <button onClick={handleGoogleLogin}>Iniciar sesión con Google</button>
      {/* Aquí puedes agregar el formulario para iniciar sesión con credenciales */}
    </div>
  );
}
