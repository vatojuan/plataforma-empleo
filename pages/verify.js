// pages/verify.js
import { useState } from "react";
import { useRouter } from "next/router";
import { Box, TextField, Button, Typography, Snackbar, Alert } from "@mui/material";

export default function Verify() {
  const [codigoIngresado, setCodigoIngresado] = useState("");
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const router = useRouter();

  const handleVerificar = async () => {
    // Envía el código y el email (quizás obtenido desde la sesión o query params) a un endpoint que lo compare con el almacenado en la BD
    const res = await fetch("/api/verify-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "usuario@ejemplo.com", code: codigoIngresado }),
    });
    
    const data = await res.json();
    if (res.ok) {
      setSnackbar({ open: true, message: "Correo verificado", severity: "success" });
      // Redirige o actualiza la interfaz según convenga
      router.push("/dashboard");
    } else {
      setSnackbar({ open: true, message: data.error || "Código incorrecto", severity: "error" });
    }
  };

  return (
    <Box sx={{ maxWidth: 400, mx: "auto", mt: 4, p: 3, textAlign: "center" }}>
      <Typography variant="h5" gutterBottom>
        Verificar Correo
      </Typography>
      <TextField
        label="Código de verificación"
        value={codigoIngresado}
        onChange={(e) => setCodigoIngresado(e.target.value)}
        fullWidth
        margin="normal"
      />
      <Button variant="contained" color="primary" onClick={handleVerificar}>
        Verificar
      </Button>
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={4000} 
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
