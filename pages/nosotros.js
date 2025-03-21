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
        bgcolor: "background.default",
        overflow: "hidden",
      }}
    >
      <embed
        src="/nosotros.pdf#toolbar=0&navpanes=0&scrollbar=0"
        type="application/pdf"
        style={{ width: "100vw", height: "100vh", border: "none" }}
      />
      <Box sx={{ position: "absolute", top: 16, left: 16 }}>
        <Button component={Link} href="/" variant="contained" color="primary">
          Volver al Inicio
        </Button>
      </Box>
    </Box>
  );
}
