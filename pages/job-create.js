import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Snackbar,
  Alert
} from "@mui/material";
import Link from "next/link";

export default function JobCreate() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [requirements, setRequirements] = useState("");
  const [expirationDate, setExpirationDate] = useState(""); // Nuevo estado para la fecha de expiración
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  useEffect(() => {
    if (status !== "loading" && !session) {
      router.push("/login");
    } else if (session && !session.user.role) {
      router.push("/select-role");
    }
  }, [session, status, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!session.user.id) {
      setSnackbar({ open: true, message: "No se encontró el id del usuario. Inicia sesión de nuevo.", severity: "error" });
      return;
    }
    try {
      const res = await fetch("/api/job/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          requirements,
          expirationDate: expirationDate || null, // Se envía null si no se selecciona fecha
          userId: session.user.id,
        }),
      });
      if (res.ok) {
        setSnackbar({ open: true, message: "Oferta publicada", severity: "success" });
        setTimeout(() => router.push("/job-list"), 2000);
      } else {
        const data = await res.json();
        setSnackbar({ open: true, message: "Error al publicar oferta: " + data.message, severity: "error" });
      }
    } catch (error) {
      setSnackbar({ open: true, message: "Error al publicar oferta", severity: "error" });
    }
  };

  const handleCancel = () => {
    router.push("/dashboard");
  };

  if (status === "loading" || !session) {
    return <Typography align="center" sx={{ mt: 4 }}>Cargando...</Typography>;
  }

  return (
    <Container maxWidth="sm" sx={{ textAlign: "center", mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Publicar Oferta de Empleo
      </Typography>
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ display: "flex", flexDirection: "column", gap: 2 }}
      >
        <TextField
          label="Título"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          fullWidth
        />
        <TextField
          label="Descripción"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          multiline
          rows={4}
          fullWidth
        />
        <TextField
          label="Requisitos"
          value={requirements}
          onChange={(e) => setRequirements(e.target.value)}
          required
          multiline
          rows={3}
          fullWidth
        />
        {/* Nuevo campo de fecha de expiración */}
        <TextField
          label="Fecha de Expiración (Opcional)"
          type="date"
          value={expirationDate}
          onChange={(e) => setExpirationDate(e.target.value)}
          fullWidth
          InputLabelProps={{ shrink: true }}
        />
        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
          <Button type="submit" variant="contained" color="primary">
            Publicar Oferta
          </Button>
          <Button
            variant="outlined"
            onClick={handleCancel}
            sx={{ color: "text.primary", borderColor: "text.primary" }}
          >
            Cancelar
          </Button>
        </Box>
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
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}
