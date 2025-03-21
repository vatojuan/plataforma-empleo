// pages/nosotros.js
import { Box, Container, Typography, Button } from "@mui/material";
import Link from "next/link";

export default function Nosotros() {
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default", py: 4 }}>
      <Container maxWidth="md">
        <Typography variant="h4" align="center" gutterBottom>
          Nosotros
        </Typography>

        <Box
          sx={{
            position: "relative",
            width: "100%",
            height: "calc(100vh - 250px)",
            border: "1px solid #ccc",
            borderRadius: 2,
            overflow: "hidden",
            mb: 4,
          }}
        >
          <iframe
            src="/nosotros.pdf"
            width="100%"
            height="100%"
            style={{ border: "none" }}
          ></iframe>
        </Box>

        <Box sx={{ textAlign: "center" }}>
          <Button
            component={Link}
            href="/"
            variant="contained"
            color="primary"
          >
            Volver al Inicio
          </Button>
        </Box>
      </Container>
    </Box>
  );
}
