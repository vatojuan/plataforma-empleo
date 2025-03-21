// pages/contacto.js
import Link from "next/link";
import { useState } from "react";
import { Box, Container, Typography, TextField, Button, Snackbar, Alert } from "@mui/material";
import MainLayout from "../components/MainLayout";

export default function Contacto() {
  const [formData, setFormData] = useState({ nombre: "", email: "", mensaje: "" });
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nombre || !formData.email || !formData.mensaje) {
      setSnackbar({ open: true, message: "Todos los campos son obligatorios", severity: "warning" });
      return;
    }

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        setSnackbar({ open: true, message: data.message, severity: "success" });
        setFormData({ nombre: "", email: "", mensaje: "" });
      } else {
        setSnackbar({ open: true, message: data.message, severity: "error" });
      }
    } catch (error) {
      console.error("Error al enviar el mensaje:", error);
      setSnackbar({ open: true, message: "Error al enviar el mensaje", severity: "error" });
    }
  };

  return (
    <MainLayout>
      <Box sx={{ flexGrow: 1, display: "flex", justifyContent: "center", alignItems: "center", py: 6 }}>
        <Container maxWidth="sm" sx={{ textAlign: "center" }}>
          <Typography variant="h3" gutterBottom>
            Contáctanos
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Completa el formulario para enviarnos un mensaje. Te responderemos lo antes posible.
          </Typography>

          <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              label="Nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              fullWidth
              required
            />
            <TextField
              label="Correo Electrónico"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              fullWidth
              required
            />
            <TextField
              label="Mensaje"
              name="mensaje"
              multiline
              rows={4}
              value={formData.mensaje}
              onChange={handleChange}
              fullWidth
              required
            />
            <Button type="submit" variant="contained" color="primary">
              Enviar Mensaje
            </Button>
          </Box>

          <Button component={Link} href="/" variant="text" sx={{ mt: 3 }}>
            Volver al Inicio
          </Button>
        </Container>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </MainLayout>
  );
}
