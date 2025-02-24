import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Snackbar,
  Alert,
  IconButton,
  InputAdornment,
  GlobalStyles,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

export default function ResetPassword() {
  const router = useRouter();
  const { token, email } = router.query;
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [showPassword, setShowPassword] = useState(false);

  // Espera a que el router esté listo para tener token y email
  useEffect(() => {
    if (!router.isReady) return;
    if (!token || !email) {
      router.push("/forgot-password");
    }
  }, [router.isReady, token, email, router]);

  // Función para validar que la contraseña sea segura
  const validatePassword = (pass) => {
    // Mínimo 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial.
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
    return regex.test(pass);
  };

  // Valida la contraseña en tiempo real
  const handlePasswordChange = (e) => {
    const val = e.target.value;
    setNewPassword(val);
    if (!validatePassword(val)) {
      setPasswordError("La contraseña debe tener al menos 8 caracteres, incluir mayúsculas, minúsculas, números y caracteres especiales.");
    } else {
      setPasswordError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setSnackbar({ open: true, message: "Las contraseñas no coinciden", severity: "error" });
      return;
    }
    if (!validatePassword(newPassword)) {
      setSnackbar({ 
        open: true, 
        message: "La contraseña debe tener al menos 8 caracteres, incluir mayúsculas, minúsculas, números y caracteres especiales.", 
        severity: "error" 
      });
      return;
    }
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, token, newPassword }),
    });
    const data = await res.json();
    if (res.ok) {
      setSnackbar({ open: true, message: data.message, severity: "success" });
      setTimeout(() => router.push("/login"), 3000);
    } else {
      setSnackbar({ open: true, message: data.error || "Error en la verificación", severity: "error" });
    }
  };

  return (
    <>
      <GlobalStyles
        styles={{
          "input:-webkit-autofill, input:-webkit-autofill:focus, input:-webkit-autofill:hover": {
            WebkitBoxShadow: "0 0 0 1000px transparent inset !important",
            boxShadow: "0 0 0 1000px transparent inset !important",
            WebkitTextFillColor: "#ffffff !important",
          },
        }}
      />
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "background.default",
        }}
      >
        <Container
          maxWidth="sm"
          sx={{
            textAlign: "center",
            p: 4,
            boxShadow: 3,
            borderRadius: 2,
            bgcolor: "background.paper",
          }}
        >
          <Typography variant="h4" gutterBottom>
            Restablecer Contraseña
          </Typography>
          <Typography variant="body1" gutterBottom>
            Ingrese su nueva contraseña.
          </Typography>
          <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              label="Nueva Contraseña"
              type={showPassword ? "text" : "password"}
              value={newPassword}
              onChange={handlePasswordChange}
              fullWidth
              required
              error={Boolean(passwordError)}
              helperText={passwordError}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword((prev) => !prev)} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
                sx: {
                  backgroundColor: "transparent",
                },
              }}
            />
            <TextField
              label="Confirmar Contraseña"
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              fullWidth
              required
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword((prev) => !prev)} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
                sx: {
                  backgroundColor: "transparent",
                },
              }}
            />
            <Button type="submit" variant="contained" color="primary" fullWidth>
              Restablecer Contraseña
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
    </>
  );
}
