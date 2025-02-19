import Link from "next/link";
import { Box, Container, Typography, Button } from "@mui/material";

export default function Nosotros() {
  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", bgcolor: "background.default" }}>
      <Container maxWidth="md" sx={{ textAlign: "center", p: 3 }}>
        <Typography variant="h3" gutterBottom>
          Sobre Nuestra Agencia
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Aquí habla sobre lo que hacemos en la agencia, nuestra misión, visión y cómo ayudamos a nuestros clientes a alcanzar sus objetivos.
        </Typography>

        {/* Botón para volver a la página de inicio */}
        <Button component={Link} href="/" variant="contained" color="primary">
          Volver a Inicio
        </Button>
      </Container>
    </Box>
  );
}
