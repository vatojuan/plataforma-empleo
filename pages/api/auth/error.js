// pages/auth/error.js
export default function AuthError({ error }) {
    return (
      <div style={{ textAlign: "center", marginTop: "2rem" }}>
        <h1>Error de Autenticación</h1>
        <p>{error || "Ocurrió un error durante la autenticación"}</p>
        <a href="/login">Volver al Login</a>
      </div>
    );
  }
  