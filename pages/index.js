// pages/index.js   (o el nombre de la página Home que tengas)
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/router";
import {
  Box,
  Button,
  AppBar,
  Toolbar,
  IconButton,
  Fab,
  SvgIcon,
  Menu,
  MenuItem,
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
  const router = useRouter();
  const [solucionesAnchor, setSolucionesAnchor] = useState(null);

  const handleSolucionesOpen = (event) => {
    setSolucionesAnchor(event.currentTarget);
  };

  const handleSolucionesClose = () => {
    setSolucionesAnchor(null);
  };

  const handleSolucionesNavigate = (path) => {
    handleSolucionesClose();
    router.push(path);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* VIDEO DE FONDO PARA ESCRITORIO */}
      <Box
        component="video"
        src="/videos/nuevo-fondo.mp4"
        autoPlay
        muted
        loop
        playsInline
        sx={{
          display: { xs: "none", sm: "block" },
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "center",
          backgroundColor: "#103B40",
          zIndex: -2,
        }}
      />

      {/* VIDEO DE FONDO PARA MÓVILES */}
      <Box
        component="video"
        src="/videos/video-movil.mp4"
        autoPlay
        muted
        loop
        playsInline
        sx={{
          display: { xs: "block", sm: "none" },
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          objectFit: "contain",
          objectPosition: "center",
          backgroundColor: "#103B40",
          zIndex: -2,
        }}
      />

      {/* APPBAR */}
      <AppBar
        position="static"
        sx={(theme) => ({
          backgroundColor: "transparent !important",
          boxShadow: "none",
          [theme.breakpoints.down("sm")]: {
            backgroundColor: "rgba(16,59,64,0.9) !important",
          },
        })}
      >
        <Toolbar sx={{ flexWrap: "wrap", gap: 1 }}>
          {/* Botones de navegación */}
          <Button component={Link} href="/nosotros" color="inherit">
            Nosotros
          </Button>

          <Button color="inherit" onClick={handleSolucionesOpen}>
            Soluciones
          </Button>
          <Menu
            id="soluciones-menu"
            anchorEl={solucionesAnchor}
            open={Boolean(solucionesAnchor)}
            onClose={handleSolucionesClose}
            MenuListProps={{ "aria-labelledby": "soluciones-button" }}
          >
            <MenuItem
              onClick={() =>
                handleSolucionesNavigate("/soluciones/recruitment")
              }
            >
              Recruitment Process
            </MenuItem>
            <MenuItem
              onClick={() =>
                handleSolucionesNavigate("/soluciones/capacitacion")
              }
            >
              Capacitación y Desarrollo
            </MenuItem>
            <MenuItem
              onClick={() => handleSolucionesNavigate("/soluciones/branding")}
            >
              Employer Branding & Engagement
            </MenuItem>
            <MenuItem
              onClick={() => handleSolucionesNavigate("/soluciones/outsourcing")}
            >
              Outsourcing
            </MenuItem>
            <MenuItem
              onClick={() =>
                handleSolucionesNavigate("/soluciones/talent_management")
              }
            >
              Talent Management
            </MenuItem>
          </Menu>

          <Button component={Link} href="/contacto" color="inherit">
            Contacto
          </Button>
          <Button
            variant="outlined"
            color="inherit"
            onClick={() =>
              (window.location.href = "https://fapmendoza.online/cv/upload")
            }
          >
            Subir CV
          </Button>
          {status === "loading" ? null : session ? (
            <Button component={Link} href="/dashboard" color="inherit">
              Dashboard
            </Button>
          ) : (
            <Button component={Link} href="/login" color="inherit">
              Ingresar
            </Button>
          )}

          {/* Redes sociales */}
          <Box sx={{ ml: "auto", display: "flex", gap: 1 }}>
            <IconButton
              onClick={() =>
                window.open("https://www.instagram.com/faprrhh", "_blank")
              }
              color="inherit"
            >
              <InstagramIcon />
            </IconButton>
            <IconButton
              onClick={() =>
                window.open(
                  "https://www.linkedin.com/in/florenciaalvarezfap",
                  "_blank"
                )
              }
              color="inherit"
            >
              <LinkedInIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Contenido flexible */}
      <Box sx={{ flexGrow: 1 }} />

      {/* FOOTER */}
      <Footer />

      {/* Botón flotante de WhatsApp */}
      <Box
        sx={{
          position: "fixed",
          bottom: 16,
          right: 16,
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
      >
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
