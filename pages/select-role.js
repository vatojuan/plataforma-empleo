import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useSession, signOut, signIn } from "next-auth/react";
import {
  Box,
  Container,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Snackbar,
  Alert,
} from "@mui/material";

export default function SelectRole() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState("empleado");
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  useEffect(() => {
    if (status !== "loading" && !session) {
      router.push("/login");
    } else if (session && session.user.role) {
      router.push("/dashboard");
    }
  }, [session, status, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const res = await fetch("/api/auth/select-role", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: session.user.email, role: selectedRole }),
    });
  
    if (res.ok) {
      setSnackbar({ open: true, message: "Rol seleccionado con éxito", severity: "success" });
  
      // 🔄 Forzar actualización del session.token.role
      if (typeof window !== "undefined") {
        const { update } = await import("next-auth/react");
        await update(); // Esto volverá a consultar el backend y actualizará el role en session
      }
  
      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
    } else {
      setSnackbar({ open: true, message: "Error al actualizar el rol", severity: "error" });
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
      <Container
        maxWidth="sm"
        sx={{
          textAlign: "center",
          p: 4,
          pt: 6, // Aumentamos el padding top para dar más espacio al título
          boxShadow: 3,
          borderRadius: 2,
          bgcolor: "background.paper",
          position: "relative",
          zIndex: 1,
        }}
      >
        <Typography variant="h4" gutterBottom sx={{ position: "relative", zIndex: 2 }}>
          Selecciona tu Rol
        </Typography>
        <Typography variant="body1" sx={{ mb: 3 }}>
          Elige si eres Empleado o Empleador:
        </Typography>

        <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <FormControl fullWidth>
            <InputLabel id="role-label" shrink>
              Tipo de Usuario
            </InputLabel>
            <Select
              labelId="role-label"
              id="role-select"
              value={selectedRole}
              label="Tipo de Usuario"
              onChange={(e) => setSelectedRole(e.target.value)}
            >
              <MenuItem value="empleado">Empleado</MenuItem>
              <MenuItem value="empleador">Empleador</MenuItem>
            </Select>
          </FormControl>

          <Button type="submit" variant="contained" color="primary" fullWidth>
            Confirmar Rol
          </Button>
        </Box>

        <Button
          onClick={() => signOut({ redirect: true, callbackUrl: "/login" })}
          variant="outlined"
          color="error"
          fullWidth
          sx={{ mt: 2 }}
        >
          Cerrar sesión
        </Button>
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
