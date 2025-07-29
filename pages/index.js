// pages/index.js
import { useSession } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/router";
import { Box, Button } from "@mui/material";
import MainLayout from "../components/MainLayout";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [solucionesAnchor, setSolucionesAnchor] = useState(null);

  // Estas funciones las provee MainLayout, solo las declaramos
  const handleSolucionesOpen = (event) => setSolucionesAnchor(event.currentTarget);
  const handleSolucionesClose = () => setSolucionesAnchor(null);
  const handleSolucionesNavigate = (path) => {
    handleSolucionesClose();
    router.push(path);
  };

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

      {/* Aquí va el resto de tu contenido: */}
      <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 2,
        }}
      >
        {/* Ejemplo de botón que tenías antes */}
        {status === "loading" ? null : session ? (
          <Button
            variant="contained"
            onClick={() => router.push("/dashboard")}
          >
            Dashboard
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
