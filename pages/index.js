// pages/index.js
import { useSession } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/router";
import MainLayout from "../components/MainLayout";
import { Box, Button } from "@mui/material";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [solucionesAnchor, setSolucionesAnchor] = useState(null);

  // Estas funciones para el menú Soluciones las pasa MainLayout
  // así que aquí solo deberías preocuparte de tu contenido...

  return (
    <MainLayout>
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
          zIndex: -2,
        }}
      />

      {/* Contenido principal de la Home (espacio vacío o tu hero) */}
      <Box
        sx={{
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#FFF",
          textAlign: "center",
          p: 2,
        }}
      >
        {/* Ejemplo: un botón de acceso al dashboard o login */}
        {status === "loading" ? null : session ? (
          <Button
            variant="contained"
            onClick={() => router.push("/dashboard")}
          >
            Ir al Dashboard
          </Button>
        ) : (
          <Button variant="outlined" onClick={() => router.push("/login")}>
            Ingresar
          </Button>
        )}
      </Box>
    </MainLayout>
  );
}
