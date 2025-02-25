import Link from "next/link";
import { useSession } from "next-auth/react";
import { Box, Typography, Button, AppBar, Toolbar, Container, IconButton, Fab, SvgIcon } from "@mui/material";
import Footer from "../components/Footer";
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import LinkedInIcon from '@mui/icons-material/LinkedIn';

// Componente para el ícono de Instagram personalizado
function InstagramIcon(props) {
  return (
    <SvgIcon {...props}>
      <path d="M7.5 2C4.46243 2 2 4.46243 2 7.5V16.5C2 19.5376 4.46243 22 7.5 22H16.5C19.5376 22 22 19.5376 22 16.5V7.5C22 4.46243 19.5376 2 16.5 2H7.5ZM12 7C14.2091 7 16 8.79086 16 11C16 13.2091 14.2091 15 12 15C9.79086 15 8 13.2091 8 11C8 8.79086 9.79086 7 12 7ZM18 6.5C18 7.32843 17.3284 8 16.5 8C15.6716 8 15 7.32843 15 6.5C15 5.67157 15.6716 5 16.5 5C17.3284 5 18 5.67157 18 6.5Z" />
    </SvgIcon>
  );
}

export default function Home() {
  const { data: session, status } = useSession();

  return (
    <Box sx={{ position: "relative", minHeight: "100vh", overflow: "hidden" }}>
      {/* Video de fondo */}
      <Box
        component="video"
        autoPlay
        muted
        loop
        playsInline
        src="/videos/fondo-recursos-humanos.mp4" // Ubica aquí tu video
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          zIndex: -2,
        }}
      />

      {/* Overlay semitransparente */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          bgcolor: "rgba(0, 0, 0, 0.4)",
          zIndex: -1,
        }}
      />

      {/* Contenedor principal */}
      <Box sx={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        {/* AppBar */}
        <AppBar position="static" sx={{ mb: 4, backgroundColor: "transparent", boxShadow: "none" }}>
          <Toolbar sx={{ justifyContent: "center", flexDirection: { xs: "column", sm: "row" } }}>
            <Button component={Link} href="/nosotros" color="inherit">
              Nosotros
            </Button>
            <Button component={Link} href="/soluciones" color="inherit">
              Soluciones
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

            {/* Íconos de redes sociales */}
            <Box sx={{ ml: "auto", display: "flex" }}>
              <IconButton onClick={() => window.open("https://www.instagram.com/faprrhh", "_blank")} color="inherit">
                <InstagramIcon />
              </IconButton>
              <IconButton onClick={() => window.open("https://www.linkedin.com/in/florenciaalvarezfap", "_blank")} color="inherit">
                <LinkedInIcon />
              </IconButton>
            </Box>
          </Toolbar>
        </AppBar>

        {/* Contenido principal */}
        <Container maxWidth="md" sx={{ textAlign: "center", p: 3, mt: 8 }}>
          <Typography variant="h3" gutterBottom sx={{ color: "#fff" }}>
            Bienvenido a Nuestra Plataforma
          </Typography>
          <Typography variant="body1" sx={{ mb: 4, color: "#fff" }}>
            Descubre más sobre nuestra agencia y contáctanos para mayor información.
          </Typography>
          {status !== "loading" && (
            <Button component={Link} href={session ? "/dashboard" : "/login"} variant="contained" color="primary">
              {session ? "Ir al Dashboard" : "Iniciar Sesión"}
            </Button>
          )}
        </Container>

        {/* Espacio flexible para empujar el Footer hacia abajo */}
        <Box sx={{ flexGrow: 1 }} />

        {/* Footer envuelto en un contenedor para colocarlo al final */}
        <Box>
          <Footer />
        </Box>
      </Box>

      {/* Botón flotante de WhatsApp */}
      <Box sx={{ position: "fixed", bottom: 16, right: 16, zIndex: 2 }}>
        <Fab color="success" aria-label="WhatsApp" onClick={() => window.open("https://wa.me/1234567890", "_blank")}>
          <WhatsAppIcon />
        </Fab>
      </Box>
    </Box>
  );
}
