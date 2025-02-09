import { signIn } from "next-auth/react";
import { useState } from "react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Iniciar sesión con email y contraseña
  const handleEmailLogin = async (e) => {
    e.preventDefault();
    const result = await signIn("credentials", {
      redirect: false,
      email,
      password,
      callbackUrl: "/dashboard",
    });
    if (result?.ok) {
      window.location.href = "/dashboard";
    } else {
      alert("Error al iniciar sesión con email.");
    }
  };

  // Iniciar sesión con Google forzando la selección de cuenta
  const handleGoogleLogin = () => {
    signIn("google", { callbackUrl: "/dashboard", prompt: "select_account" });
  };

  return (
    <div style={{ textAlign: "center", marginTop: "2rem" }}>
      <h1>Iniciar Sesión</h1>
      <button onClick={handleGoogleLogin}>Iniciar sesión con Google</button>
      <hr style={{ margin: "1rem 0" }} />
      <form onSubmit={handleEmailLogin}>
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
        <button type="submit">Iniciar Sesión con Email</button>
      </form>
      <p>
        ¿No tienes cuenta? <a href="/register">Regístrate</a>
      </p>
    </div>
  );
}
