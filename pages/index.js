import Link from "next/link";
import { useSession } from "next-auth/react";
import { Box, Typography, Button, AppBar, Toolbar, Container } from "@mui/material";

export default function Home() {
  const { data: session, status } = useSession();

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", bgcolor: "background.default" }}>
      {/* Barra de navegación */}
      <AppBar position="static" sx={{ mb: 4 }}>
        <Toolbar sx={{ justifyContent: "center", flexDirection: { xs: "column", sm: "row" } }}>
          <Button component={Link} href="/nosotros" color="inherit">
            Nosotros
          </Button>
          <Button component={Link} href="/historia" color="inherit">
            Historia
          </Button>
          <Button component={Link} href="/contacto" color="inherit">
            Contacto
          </Button>
          {status === "loading" ? null : session ? (
            <Button component={Link} href="/dashboard" color="inherit">
              Dashboard
            </Button>
          ) : (
            <Button component={Link} href="/login" color="inherit">
              Ingresar Al Portal
            </Button>
          )}
        </Toolbar>
      </AppBar>

      {/* Contenido Principal */}
      <Container maxWidth="md" sx={{ textAlign: "center", p: 3, width: { xs: "90%", sm: "100%" } }}>
        <Typography variant="h3" gutterBottom>
          Bienvenido a Nuestra Plataforma
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Descubre más sobre nuestra agencia, conoce nuestra historia y contáctanos para mayor información.
        </Typography>

        {/* Botón principal basado en estado de sesión */}
        {status !== "loading" && (
          <Button
            component={Link}
            href={session ? "/dashboard" : "/login"}
            variant="contained"
            color="primary"
            sx={{ mt: 2 }}
          >
            {session ? "Ir al Dashboard" : "Iniciar Sesión"}
          </Button>
        )}
      </Container>
    </Box>
  );
}
