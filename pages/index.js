// pages/index.js
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useState } from "react";
import {
  Box,
  Typography,
  Button,
  AppBar,
  Toolbar,
  Container,
  IconButton,
  Fab,
  SvgIcon,
  Menu,
  MenuItem,
} from "@mui/material";
import Footer from "../components/Footer";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import { useRouter } from "next/router";

// Ícono personalizado de Instagram
function InstagramIcon(props) {
  return (
    <SvgIcon {...props}>
      <path d="M7.5 2C4.46243 2 2 4.46243 2 7.5V16.5C2 19.5376 4.46243 22 7.5 22H16.5C19.5376 22 22 19.5376 22 16.5V7.5C22 4.46243 19.5376 2 16.5 2H7.5ZM12 7C14.2091 7 16 8.79086 16 11C16 13.2091 14.2091 15 12 15C9.79086 15 8 13.2091 8 11C8 8.79086 9.79086 7 12 7ZM18 6.5C18 7.32843 17.3284 8 16.5 8C15.6716 8 15 7.32843 15 6.5C15 5.67157 15.6716 5 16.5 5C17.3284 5 18 5.67157 18 6.5Z" />
    </SvgIcon>
  );
}

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleSolucionesOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleSolucionesClose = () => {
    setAnchorEl(null);
  };

  const navigateTo = (path) => {
    handleSolucionesClose();
    router.push(path);
  };

  return (
    <Box sx={{ position: "relative", minHeight: "100vh", overflow: "hidden" }}>
      {/* Video de fondo */}
      <Box
        component="video"
        autoPlay
        muted
        loop
        playsInline
        src="/videos/fondo-recursos-humanos.mp4"
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

      {/* Overlay oscuro */}
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

      {/* Contenido con AppBar */}
      <Box sx={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        <AppBar position="static" sx={{ mb: 4, backgroundColor: "transparent", boxShadow: "none" }}>
          <Toolbar sx={{ flexDirection: { xs: "column", sm: "row" }, alignItems: "center" }}>
            <Button component={Link} href="/nosotros" color="inherit">
              Nosotros
            </Button>

            {/* Menú desplegable de Soluciones */}
            <Button color="inherit" onClick={handleSolucionesOpen}>
              Soluciones
            </Button>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleSolucionesClose}
              anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
            >
              <MenuItem onClick={() => navigateTo("/soluciones/recruitment")}>Recruitment Process</MenuItem>
              <MenuItem onClick={() => navigateTo("/soluciones/capacitacion")}>Capacitación y Desarrollo</MenuItem>
              <MenuItem onClick={() => navigateTo("/soluciones/branding")}>Employer Branding & Engagement</MenuItem>
              <MenuItem onClick={() => navigateTo("/soluciones/outsourcing")}>Outsourcing</MenuItem>
            </Menu>

            <Button component={Link} href="/contacto" color="inherit">
              Contacto
            </Button>

            <Button
              variant="outlined"
              color="inherit"
              sx={{ ml: 2 }}
              onClick={() => window.location.href = "https://fapmendoza.online/cv/upload"}
            >
              Subir CV
            </Button>

            {status === "loading" ? null : session ? (
              <Button component={Link} href="/dashboard" color="inherit" sx={{ ml: 2 }}>
                Dashboard
              </Button>
            ) : (
              <Button component={Link} href="/login" color="inherit" sx={{ ml: 2 }}>
                Ingresar Al Portal
              </Button>
            )}

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
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 2 }}>
              <Button
                component={Link}
                href={session ? "/dashboard" : "/login"}
                variant="contained"
                color="primary"
              >
                {session ? "Ir al Dashboard" : "Iniciar Sesión"}
              </Button>
              <Button
                variant="contained"
                color="secondary"
                onClick={() => window.location.href = "https://fapmendoza.online/cv/upload"}
              >
                Subir CV
              </Button>
            </Box>
          )}
        </Container>

        {/* Espaciador para empujar el footer al fondo */}
        <Box sx={{ flexGrow: 1 }} />

        {/* Footer */}
        <Box>
          <Footer />
        </Box>
      </Box>

      {/* Botón flotante de WhatsApp */}
      <Box sx={{ position: "fixed", bottom: 16, right: 16, zIndex: 2 }}>
        <Fab
          color="success"
          aria-label="WhatsApp"
          onClick={() => window.open("http://api.whatsapp.com/send?phone=542622542125&text=Me+interesa+el+Servicio+de+Recursos+Humanos", "_blank")}
        >
          <WhatsAppIcon />
        </Fab>
      </Box>
    </Box>
  );
}
