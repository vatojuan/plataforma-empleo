import Link from "next/link";
import { Box, Typography, Container, Button } from "@mui/material";
import Footer from "../components/Footer";

export default function Soluciones() {
  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column", bgcolor: "background.default" }}>
      <Container maxWidth="md" sx={{ textAlign: "center", py: 4 }}>
        <Typography variant="h3" gutterBottom>
          Nuestras Soluciones
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Aquí detallamos nuestras soluciones innovadoras que te ayudarán a optimizar procesos y potenciar tu negocio.
        </Typography>
        {/* Puedes agregar tarjetas, imágenes o más detalles de cada solución */}
        <Button component={Link} href="/" variant="contained" color="primary">
          Volver a Inicio
        </Button>
      </Container>
      <Footer />
    </Box>
  );
}
