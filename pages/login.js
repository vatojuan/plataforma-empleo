import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/router";
import Link from "next/link";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleCredentialsSubmit = async (e) => {
    e.preventDefault();
    const result = await signIn("credentials", {
      redirect: false,
      username,  // si usas email en lugar de username, cambia el nombre de la propiedad
      password,
    });
    if (result?.ok) {
      router.push("/dashboard");
    } else {
      alert("Error al iniciar sesión con credenciales");
    }
  };

  const handleGoogleSignIn = async () => {
    // signIn con "google" llamará a GoogleProvider en NextAuth.
    await signIn("google", { callbackUrl: "/dashboard" });
  };

  return (
    <div style={{ textAlign: "center", marginTop: "2rem" }}>
      <h1>Login</h1>
      {/* Formulario para inicio de sesión con credenciales */}
      <form onSubmit={handleCredentialsSubmit}>
        <div>
          <label>Usuario o Email:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
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
        <button type="submit">Iniciar Sesión</button>
      </form>
      <hr style={{ margin: "2rem auto", maxWidth: "300px" }} />
      {/* Botón para inicio de sesión con Google */}
      <button onClick={handleGoogleSignIn} style={{ padding: "0.5rem 1rem" }}>
        Iniciar Sesión con Google
      </button>
      <p style={{ marginTop: "1rem" }}>
        ¿No tienes cuenta? <Link href="/register">Registrarse</Link>
      </p>
    </div>
  );
}
