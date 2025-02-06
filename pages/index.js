import Link from 'next/link';

export default function Home() {
  return (
    <div style={{ textAlign: "center", padding: "2rem" }}>
      <header>
        <nav>
          <Link href="/historia">Historia</Link> |{" "}
          <Link href="/contacto">Contacto</Link> |{" "}
          <Link href="/nosotros">Nosotros</Link>
        </nav>
      </header>
      <main>
        <h1>Bienvenido a la Agencia de Recursos Humanos</h1>
        <p>Encuentra al candidato ideal o publica tus requerimientos.</p>
      </main>
      <footer style={{ marginTop: "2rem" }}>
        <Link href="/login">Iniciar Sesión</Link> |{" "}
        <Link href="/register">Registrarse</Link>
      </footer>
    </div>
  );
}
