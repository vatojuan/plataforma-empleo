// pages/job-create.jsx
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
  Alert,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
} from "@mui/material";

export default function JobCreate() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // ─────────────────────────  estados del formulario
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [requirements, setRequirements] = useState("");
  const [expirationOption, setExpirationOption] = useState("");      // 24h, 3d, …
  const [manualExpirationDate, setManualExpirationDate] = useState(""); // ISO yyyy-mm-dd
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // ─────────────────────────  redirecciones de seguridad
  useEffect(() => {
    if (status !== "loading" && !session) {
      router.push("/login");
    } else if (session && !session.user.role) {
      router.push("/select-role");
    }
  }, [session, status, router]);

  // ─────────────────────────  helpers
  const computeExpirationDate = () => {
    const now = new Date();
    switch (expirationOption) {
      case "24h":
        now.setHours(now.getHours() + 24);
        return now;
      case "3d":
        now.setDate(now.getDate() + 3);
        return now;
      case "7d":
        now.setDate(now.getDate() + 7);
        return now;
      case "15d":
        now.setDate(now.getDate() + 15);
        return now;
      case "1m":
        now.setMonth(now.getMonth() + 1);
        return now;
      case "manual":
        return manualExpirationDate ? new Date(manualExpirationDate) : null;
      default:
        return null;
    }
  };

  // ─────────────────────────  submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!session?.user?.id) {
      setSnackbar({
        open: true,
        message: "No se encontró tu sesión. Inicia sesión nuevamente.",
        severity: "error",
      });
      return;
    }

    const expirationDate = expirationOption ? computeExpirationDate() : null;

    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || "";
      const res = await fetch(`${apiBase}/api/job/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          requirements,
          userId: Number(session.user.id),
          expirationDate: expirationDate ? expirationDate.toISOString() : null,
        }),
      });

      if (res.ok) {
        setSnackbar({
          open: true,
          message: "Oferta publicada con éxito",
          severity: "success",
        });
        setTimeout(() => router.push("/job-list"), 1800);
      } else {
        const { detail, message } = await res.json();
        setSnackbar({
          open: true,
          message: `Error al publicar: ${detail || message}`,
          severity: "error",
        });
      }
    } catch (err) {
      console.error(err);
      setSnackbar({
        open: true,
        message: "Error de red al publicar la oferta",
        severity: "error",
      });
    }
  };

  const handleCancel = () => router.push("/dashboard");

  if (status === "loading" || !session) {
    return (
      <Typography align="center" sx={{ mt: 4 }}>
        Cargando…
      </Typography>
    );
  }

  // ─────────────────────────  UI
  return (
    <Container maxWidth="sm" sx={{ mt: 4, textAlign: "center" }}>
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
          fullWidth
          multiline
          rows={4}
        />
        <TextField
          label="Requisitos"
          value={requirements}
          onChange={(e) => setRequirements(e.target.value)}
          required
          fullWidth
          multiline
          rows={3}
        />

        <FormControl fullWidth>
          <InputLabel id="exp-label">Expiración</InputLabel>
          <Select
            labelId="exp-label"
            value={expirationOption}
            label="Expiración"
            onChange={(e) => setExpirationOption(e.target.value)}
          >
            <MenuItem value="24h">24 horas</MenuItem>
            <MenuItem value="3d">3 días</MenuItem>
            <MenuItem value="7d">7 días</MenuItem>
            <MenuItem value="15d">15 días</MenuItem>
            <MenuItem value="1m">1 mes</MenuItem>
            <MenuItem value="manual">Fecha manual</MenuItem>
          </Select>
        </FormControl>

        {expirationOption === "manual" && (
          <TextField
            label="Fecha de expiración"
            type="date"
            value={manualExpirationDate}
            onChange={(e) => setManualExpirationDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />
        )}

        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
          <Button type="submit" variant="contained">
            Publicar Oferta
          </Button>
          <Button variant="outlined" onClick={handleCancel}>
            Cancelar
          </Button>
        </Box>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
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
