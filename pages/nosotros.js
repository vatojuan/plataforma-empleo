// pages/nosotros.js
import { Box, Button } from "@mui/material";
import Link from "next/link";

export default function Nosotros() {
  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        bgcolor: "background.default",
      }}
    >
      <object
        data="/nosotros.pdf#toolbar=0&navpanes=0&scrollbar=0"
        type="application/pdf"
        width="100%"
        height="100%"
        style={{ display: "block" }}
      >
        <p>
          El PDF no se pudo cargar.{" "}
          <a href="/nosotros.pdf" target="_blank" rel="noopener noreferrer">
            Descargar PDF
          </a>
        </p>
      </object>
      <Box sx={{ position: "absolute", top: 16, left: 16 }}>
        <Button component={Link} href="/" variant="contained" color="primary">
          Volver al Inicio
        </Button>
      </Box>
    </Box>
  );
}
