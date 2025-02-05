// pages/index.js
export default function Home() {
  return (
    <div style={{ textAlign: "center", marginTop: "2rem" }}>
      <h1>Bienvenido a Agencia RR</h1>
      <p>Esta es la plataforma para que candidatos y empleadores se conecten.</p>
      <p>
        <a href="/login">Inicia sesión</a> | <a href="/register">Regístrate</a>
      </p>
    </div>
  );
}
