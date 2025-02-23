import { useState } from "react";
import { useRouter } from "next/router";
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Snackbar,
  Alert,
} from "@mui/material";
import Link from "next/link";

export default function Register() {
  const [userType, setUserType] = useState("empleado");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, name, password, role: userType }),
    });

    if (res.ok) {
      setSnackbar({ open: true, message: "Registro exitoso. Revisa tu correo para confirmar la cuenta.", severity: "success" });
      setTimeout(() => router.push("/login"), 3000);
    } else {
      const data = await res.json();
      setSnackbar({ open: true, message: "Error en el registro: " + data.message, severity: "error" });
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "background.default" }}>
      <Container maxWidth="sm" sx={{ textAlign: "center", p: 4, boxShadow: 3, borderRadius: 2, bgcolor: "background.paper" }}>
        <Typography variant="h4" gutterBottom>
          Registro
        </Typography>

        <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <FormControl fullWidth sx={{ mb: 1 }}>
            <InputLabel id="user-type-label">Tipo de Usuario</InputLabel>
            <Select
              labelId="user-type-label"
              value={userType}
              label="Tipo de Usuario"
              onChange={(e) => setUserType(e.target.value)}
              required
            >
              <MenuItem value="empleado">Empleado</MenuItem>
              <MenuItem value="empleador">Empleador</MenuItem>
            </Select>
          </FormControl>

          <TextField
            label="Correo Electrónico"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
            required
          />
          <TextField
            label="Nombre"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            required
          />
          <TextField
            label="Contraseña"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            required
          />
          <Button type="submit" variant="contained" color="primary" fullWidth>
            Registrarse
          </Button>
        </Box>

        <Typography variant="body2" sx={{ mt: 2 }}>
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" style={{ color: "#103B40", textDecoration: "none" }}>
            Inicia sesión aquí
          </Link>
        </Typography>
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
