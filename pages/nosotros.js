// pages/nosotros.js
import { Box, Button } from "@mui/material";
import Link from "next/link";

export default function Nosotros() {
  return (
    <Box
      sx={{
        width: "100vw",
        height: "100vh",
        bgcolor: "background.default",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <iframe
        src="/nosotros.pdf#toolbar=0&navpanes=0&scrollbar=0"
        style={{
          width: "100%",
          height: "100%",
          border: "none",
        }}
      ></iframe>
      <Box sx={{ position: "absolute", top: 16, left: 16 }}>
        <Button component={Link} href="/" variant="contained" color="primary">
          Volver al Inicio
        </Button>
      </Box>
    </Box>
  );
}
