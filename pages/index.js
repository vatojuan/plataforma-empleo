import { useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  Box,
  Button,
  AppBar,
  Toolbar,
  IconButton,
  Fab,
  SvgIcon
} from "@mui/material";
import Footer from "../components/Footer";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import LinkedInIcon from "@mui/icons-material/LinkedIn";

function InstagramIcon(props) {
  return (
    <SvgIcon {...props}>
      <path d="M7.5 2C4.46243 2 2 4.46243 2 7.5V16.5C2 19.5376 4.46243 22 7.5 22H16.5C19.5376 22 22 19.5376 22 16.5V7.5C22 4.46243 19.5376 2 16.5 2H7.5ZM12 7C14.2091 7 16 8.79086 16 11C16 13.2091 14.2091 15 12 15C9.79086 15 8 13.2091 8 11C8 8.79086 9.79086 7 12 7ZM18 6.5C18 7.32843 17.3284 8 16.5 8C15.6716 8 15 7.32843 15 6.5C15 5.67157 15.6716 5 16.5 5C17.3284 5 18 5.67157 18 6.5Z" />
    </SvgIcon>
  );
}

export default function Home() {
  const { data: session, status } = useSession();

  // Ajusta la altura real del viewport en móviles para corregir el 100vh
  useEffect(() => {
    const setVH = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };
    setVH();
    window.addEventListener('resize', setVH);
    return () => window.removeEventListener('resize', setVH);
  }, []);

  return (
    <Box
      sx={{
        position: "relative",
        minHeight: "calc(var(--vh, 1vh) * 100)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden"
      }}
    >
      {/* VIDEO DE FONDO: llena todo el viewport */}
      <Box
        component="video"
        autoPlay
        muted
        loop
        playsInline
        src="/videos/nuevo-fondo.mp4"
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "calc(var(--vh, 1vh) * 100)",
          objectFit: "cover", // Rellena y recorta si es necesario
          zIndex: -2
        }}
      />

      {/* Puedes agregar un overlay sutil si deseas suavizar el video */}
      {/* <Box
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "calc(var(--vh, 1vh) * 100)",
          bgcolor: "rgba(0, 0, 0, 0.2)",
          zIndex: -1
        }}
      /> */}

      {/* APPBAR transparente */}
      <AppBar
        position="static"
        sx={{
          backgroundColor: "transparent",
          boxShadow: "none"
        }}
      >
        <Toolbar
          sx={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between"
          }}
        >
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button component={Link} href="/nosotros" color="inherit">
              Nosotros
            </Button>
            <Button component={Link} href="/soluciones" color="inherit">
              Soluciones
            </Button>
            <Button component={Link} href="/contacto" color="inherit">
              Contacto
            </Button>
            <Button
              variant="outlined"
              color="inherit"
              onClick={() =>
                window.location.href = "https://fapmendoza.online/cv/upload"
              }
            >
              Subir CV
            </Button>
          </Box>
          <Box sx={{ display: "flex", gap: 1 }}>
            {status === "loading" ? null : session ? (
              <Button component={Link} href="/dashboard" color="inherit">
                Dashboard
              </Button>
            ) : (
              <Button component={Link} href="/login" color="inherit">
                Ingresar Al Portal
              </Button>
            )}
            <IconButton
              onClick={() => window.open("https://www.instagram.com/faprrhh", "_blank")}
              color="inherit"
            >
              <InstagramIcon />
            </IconButton>
            <IconButton
              onClick={() => window.open("https://www.linkedin.com/in/florenciaalvarezfap", "_blank")}
              color="inherit"
            >
              <LinkedInIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Espaciador para empujar el Footer */}
      <Box sx={{ flexGrow: 1 }} />

      {/* FOOTER: puede mantenerse transparente o ajustarse según convenga */}
      <Box sx={{ backgroundColor: "transparent" }}>
        <Footer />
      </Box>

      {/* BOTÓN FLOTANTE DE WHATSAPP */}
      <Box sx={{ position: "fixed", bottom: 16, right: 16, zIndex: 2 }}>
        <Fab
          color="success"
          aria-label="WhatsApp"
          onClick={() =>
            window.open(
              "http://api.whatsapp.com/send?phone=542622542125&text=Me+interesa+el+Servicio+de+Recursos+Humanos",
              "_blank"
            )
          }
        >
          <WhatsAppIcon />
        </Fab>
      </Box>
    </Box>
  );
}
