// pages/index.js
import Link from 'next/link';

export default function Home() {
  return (
    <div style={{ textAlign: "center", padding: "2rem" }}>
      <header>
        <nav>
          <Link href="/historia"><a>Historia</a></Link> |{" "}
          <Link href="/contacto"><a>Contacto</a></Link> |{" "}
          <Link href="/nosotros"><a>Nosotros</a></Link>
        </nav>
      </header>
      <main>
        <h1>Bienvenido a la Agencia de Recursos Humanos</h1>
        <p>Encuentra al candidato ideal o publica tus requerimientos.</p>
      </main>
      <footer style={{ marginTop: "2rem" }}>
        <Link href="/login"><a>Iniciar Sesión</a></Link> |{" "}
        <Link href="/register"><a>Registrarse</a></Link>
      </footer>
    </div>
  );
}
