// pages/job-offer.js

import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Container,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Divider,
  Button,
  Paper,
  Stack,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import DashboardLayout from "../components/DashboardLayout";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "https://api.fapmendoza.online";

export default function JobOfferPage() {
  const router = useRouter();
  const { id } = router.query;

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchJob = async () => {
      setLoading(true);
      setError(false);
      try {
        const res = await fetch(`${API_BASE}/api/job/${id}`);
        if (!res.ok) throw new Error("Oferta no encontrada");
        const result = await res.json();
        // El API devuelve { job: { ... } }
        setJob(result.job);
      } catch (err) {
        console.error("[JobOffer] error:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [id]);

  // Fecha de publicación: intentamos createdAt o created_at
  const postedDate = job?.createdAt || job?.created_at || null;

  return (
    <DashboardLayout>
      <Container maxWidth="md" sx={{ mt: 4 }}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
            <CircularProgress />
            <Typography sx={{ ml: 2 }}>Cargando oferta…</Typography>
          </Box>
        ) : error || !job ? (
          <Alert severity="error">
            Oferta no encontrada
            <br />
            La oferta que buscas no existe o ha sido eliminada.
          </Alert>
        ) : (
          <>
            {/* Título */}
            <Typography variant="h4" gutterBottom>
              {job.title}
            </Typography>

            {/* Descripción */}
            <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
              <Typography
                variant="body1"
                sx={{ whiteSpace: "pre-line", lineHeight: 1.6 }}
              >
                {job.description}
              </Typography>
            </Paper>

            {/* Requisitos */}
            {job.requirements && (
              <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Requisitos
                </Typography>
                <Typography
                  variant="body1"
                  sx={{ whiteSpace: "pre-line", lineHeight: 1.6 }}
                >
                  {job.requirements}
                </Typography>
              </Paper>
            )}

            {/* Fechas y expiración */}
            <Box sx={{ mb: 2, color: "text.secondary" }}>
              <Typography variant="body2">
                <strong>Publicado el:</strong>{" "}
                {postedDate
                  ? new Date(postedDate).toLocaleDateString()
                  : "Sin fecha"}
              </Typography>
              <Typography variant="body2" color="error">
                <strong>Expiración:</strong>{" "}
                {job.expirationDate
                  ? new Date(job.expirationDate).toLocaleDateString()
                  : "Sin expiración"}
              </Typography>
            </Box>

            {/* Contador de candidatos */}
            <Box sx={{ mb: 4, display: "flex", alignItems: "center", gap: 1 }}>
              <PersonIcon />
              <Typography variant="body2">
                Candidatos postulados: {job.candidatesCount ?? 0}
              </Typography>
            </Box>

            {/* Botones de navegación */}
            <Stack direction="row" spacing={2} justifyContent="center">
              <Button component={Link} href="/dashboard" variant="contained">
                Volver al Dashboard
              </Button>
              <Button component={Link} href="/job-list" variant="outlined">
                Ver Ofertas
              </Button>
            </Stack>
          </>
        )}
      </Container>
    </DashboardLayout>
  );
}

// Evitamos prerendering en Vercel
export const getServerSideProps = () => ({ props: {} });
