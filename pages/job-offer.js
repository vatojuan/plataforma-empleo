import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Container, Box, Typography, Button, Paper, Stack } from "@mui/material";
import PersonIcon from "@mui/icons-material/Person"; // Importamos el icono

export default function JobOffer() {
  const router = useRouter();
  const { id } = router.query;
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      async function fetchJob() {
        try {
          const res = await fetch(`/api/job/get?id=${id}`);
          if (res.ok) {
            const data = await res.json();
            setJob(data);
          } else {
            setJob(null);
          }
        } catch (error) {
          console.error("Error obteniendo la oferta:", error);
          setJob(null);
        } finally {
          setLoading(false);
        }
      }
      fetchJob();
    }
  }, [id]);

  if (loading) {
    return (
      <Container sx={{ textAlign: "center", mt: 4 }}>
        <Typography variant="h5">Cargando oferta...</Typography>
      </Container>
    );
  }

  if (!job) {
    return (
      <Container sx={{ textAlign: "center", mt: 4 }}>
        <Paper elevation={3} sx={{ p: 3, mb: 2 }}>
          <Typography variant="h4" gutterBottom>
            Oferta no encontrada
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            La oferta que buscas no existe o ha sido eliminada.
          </Typography>
          <Stack direction="row" spacing={2} justifyContent="center">
            <Button component={Link} href="/dashboard" variant="contained" color="primary">
              Volver al Dashboard
            </Button>
            <Button component={Link} href="/job-list" variant="contained" color="primary">
              Ofertas de empleo
            </Button>
          </Stack>
        </Paper>
      </Container>
    );
  }

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        {job.title}
      </Typography>
      <Paper elevation={3} sx={{ p: 3, mb: 2 }}>
        <Typography variant="body1" sx={{ whiteSpace: "pre-line", lineHeight: 1.6 }}>
          {job.description}
        </Typography>
      </Paper>
      {job.requirements && (
        <Paper elevation={3} sx={{ p: 3, mb: 2 }}>
          <Typography variant="h6">Requisitos</Typography>
          <Typography variant="body1" sx={{ whiteSpace: "pre-line", lineHeight: 1.6 }}>
            {job.requirements}
          </Typography>
        </Paper>
      )}
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" color="text.secondary" sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>Publicado el: {job.postedAt ? new Date(job.postedAt).toLocaleDateString() : "Sin fecha"}</span>
            <span style={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            </span>
          </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>                      
          Candidatos postulados: {job.candidatesCount || 0}
          <PersonIcon fontSize="small" />
        </Typography>
      </Box>
      <Stack direction="row" spacing={2} justifyContent="center">
        <Button component={Link} href="/dashboard" variant="contained" color="primary">
          Volver al Dashboard
        </Button>
        <Button component={Link} href="/job-list" variant="contained" color="primary">
          Ofertas de empleo
        </Button>
      </Stack>
    </Container>
  );
}
