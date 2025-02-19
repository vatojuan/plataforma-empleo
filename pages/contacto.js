import Link from "next/link";
import { useState } from "react";
import { Box, Container, Typography, TextField, Button, Snackbar, Alert } from "@mui/material";

export default function Contacto() {
  const [formData, setFormData] = useState({ nombre: "", email: "", mensaje: "" });
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.nombre || !formData.email || !formData.mensaje) {
      setSnackbar({ open: true, message: "Todos los campos son obligatorios", severity: "warning" });
      return;
    }

    // Aquí iría la lógica para enviar el email (por ejemplo, una API de contacto)
    console.log("Datos enviados:", formData);
    setSnackbar({ open: true, message: "Mensaje enviado correctamente", severity: "success" });

    // Limpiar formulario
    setFormData({ nombre: "", email: "", mensaje: "" });
  };

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", bgcolor: "background.default" }}>
      <Container maxWidth="sm" sx={{ textAlign: "center", p: 3 }}>
        <Typography variant="h3" gutterBottom>
          Contáctanos
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Completa el formulario para enviarnos un mensaje. Te responderemos lo antes posible.
        </Typography>

        <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField label="Nombre" name="nombre" value={formData.nombre} onChange={handleChange} fullWidth required />
          <TextField label="Correo Electrónico" name="email" type="email" value={formData.email} onChange={handleChange} fullWidth required />
          <TextField label="Mensaje" name="mensaje" multiline rows={4} value={formData.mensaje} onChange={handleChange} fullWidth required />
          <Button type="submit" variant="contained" color="primary">
            Enviar Mensaje
          </Button>
        </Box>

        {/* Botón para volver a la página de inicio */}
        <Button component={Link} href="/" variant="text" sx={{ mt: 3 }}>
          Volver a Inicio
        </Button>
      </Container>

      {/* Notificación Snackbar */}
      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
