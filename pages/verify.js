import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Box, Container, Typography, TextField, Button, Snackbar, Alert } from "@mui/material";

export default function Verify() {
  const router = useRouter();
  const { email } = router.query; // Se obtiene el email desde la URL
  const [codigo, setCodigo] = useState("");
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  // Si no se encuentra el email en el query, se puede redirigir o mostrar un error
  useEffect(() => {
    if (!email) {
      // Redirige al registro o muestra un mensaje informando al usuario
      router.push("/register");
    }
  }, [email, router]);

  const handleVerificar = async (e) => {
    e.preventDefault();
    const res = await fetch("/api/auth/verify-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code: codigo }),
    });
    const data = await res.json();
    if (res.ok) {
      setSnackbar({ open: true, message: "¡Correo verificado exitosamente!", severity: "success" });
      setTimeout(() => router.push("/login"), 3000);
    } else {
      setSnackbar({ open: true, message: data.error || "Error en la verificación", severity: "error" });
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "background.default",
      }}
    >
      <Container maxWidth="sm" sx={{ textAlign: "center", p: 4, boxShadow: 3, borderRadius: 2, bgcolor: "background.paper" }}>
        <Typography variant="h4" gutterBottom>
          Verificar Correo
        </Typography>
        <Typography variant="body1" gutterBottom>
          Se ha enviado un código de verificación a <strong>{email}</strong>
        </Typography>
        <Box component="form" onSubmit={handleVerificar} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            label="Código de Verificación"
            type="text"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
            fullWidth
            required
          />
          <Button type="submit" variant="contained" color="primary">
            Verificar
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            onClick={async () => {
              // Llamada al endpoint para reenviar el código
              const res = await fetch("/api/auth/resend-code", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
              });
              const data = await res.json();
              if (res.ok) {
                setSnackbar({ open: true, message: data.message, severity: "success" });
              } else {
                setSnackbar({ open: true, message: data.error, severity: "error" });
              }
            }}
          >
            Reenviar código
          </Button>
        </Box>
      </Container>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
