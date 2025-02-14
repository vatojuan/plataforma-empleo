import Link from "next/link";
import { useSession } from "next-auth/react";

export default function Home() {
  const { data: session, status } = useSession();

  return (
    <div style={{ textAlign: "center", padding: "2rem" }}>
      <h1>Bienvenido a Nuestra Plataforma</h1>
      <nav style={{ marginBottom: "1rem" }}>
        <Link href="/nosotros">Nosotros</Link> {" | "}
        <Link href="/historia">Historia</Link> {" | "}
        <Link href="/contacto">Contacto</Link> {" | "}
        {status === "loading" ? null : session ? (
          <Link href="/dashboard">Dashboard</Link>
        ) : (
          <Link href="/login">Clientes</Link>
        )}
      </nav>
      <p>
        Descubre más sobre nuestra agencia, conoce nuestra historia y contáctanos
        para mayor información.
      </p>
    </div>
  );
}
