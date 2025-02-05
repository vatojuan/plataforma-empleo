// pages/dashboard.js
export default function Dashboard() {
    return (
      <div style={{ textAlign: "center", marginTop: "2rem" }}>
        <h1>Dashboard</h1>
        <p>Bienvenido a tu dashboard.</p>
        <p>
          <a href="/profile">Actualizar Perfil</a>
        </p>
        <p>
          <a href="/login">Cerrar sesión</a>
        </p>
      </div>
    );
  }
  