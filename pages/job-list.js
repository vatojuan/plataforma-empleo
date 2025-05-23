// pages/job-list.js

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Divider,
  Snackbar,
  Alert
} from "@mui/material";
import { useSession } from "next-auth/react";
import DashboardLayout from "../components/DashboardLayout";
import PersonIcon from "@mui/icons-material/Person";

export default function JobList() {
  const { data: session, status } = useSession();
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);

  // Estados para diálogos y notificaciones
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [openCancelDialog, setOpenCancelDialog] = useState(false);
  const [selectedCancelJobId, setSelectedCancelJobId] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  // URL base de tu API FastAPI
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://api.fapmendoza.online";

  useEffect(() => {
    async function fetchJobs() {
      let url = "/api/job/list";
      if (session && session.user.role === "empleador") {
        url += `?userId=${session.user.id}`;
      }
      try {
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          const now = new Date();
          setJobs(
            data.jobs.filter(
              (job) => !job.expirationDate || new Date(job.expirationDate) > now
            )
          );
        } else {
          console.error("Error al obtener las ofertas");
        }
      } catch (error) {
        console.error("Error fetching jobs:", error);
      }
    }

    async function fetchApplications() {
      if (session && session.user.role === "empleado") {
        try {
          const res = await fetch("/api/job/my-applications");
          if (res.ok) {
            const data = await res.json();
            setApplications(data.applications);
          } else {
            console.error("Error al obtener tus postulaciones");
          }
        } catch (error) {
          console.error("Error fetching applications:", error);
        }
      }
    }

    if (status !== "loading") {
      fetchJobs();
      fetchApplications();
    }
  }, [session, status]);

  const isApplied = (jobId) =>
    applications.some((app) => app.jobId === jobId);

  const updateJobCandidatesCount = (jobId, change) => {
    setJobs((prevJobs) =>
      prevJobs.map((job) =>
        job.id === jobId
          ? { ...job, candidatesCount: (job.candidatesCount || 0) + change }
          : job
      )
    );
  };

  const handleApply = async (jobId) => {
    try {
      // 1) Postulación en Next API
      const res = await fetch("/api/job/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || res.statusText);
      }

      updateJobCandidatesCount(jobId, 1);
      setSnackbar({ open: true, message: "Has postulado exitosamente", severity: "success" });

      // 2) Crear propuesta en FastAPI
      await fetch(`${API_BASE}/api/proposals/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
        body: JSON.stringify({
          job_id: jobId,
          applicant_id: session.user.id,
          label: "automatic",
        }),
      });

      // 3) Refrescar mis postulaciones
      const appRes = await fetch("/api/job/my-applications");
      if (appRes.ok) {
        const data = await appRes.json();
        setApplications(data.applications);
      }
    } catch (error) {
      console.error("Error al postular:", error);
      setSnackbar({
        open: true,
        message: `Error al postular: ${error.message}`,
        severity: "error",
      });
    }
  };

  const handleRequestCancelApplication = (jobId) => {
    setSelectedCancelJobId(jobId);
    setOpenCancelDialog(true);
  };

  const confirmCancelApplication = async () => {
    try {
      const res = await fetch("/api/job/cancel-application", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId: selectedCancelJobId }),
      });
      if (res.ok) {
        updateJobCandidatesCount(selectedCancelJobId, -1);
        setSnackbar({ open: true, message: "Postulación cancelada", severity: "success" });
        const appRes = await fetch("/api/job/my-applications");
        if (appRes.ok) {
          const data = await appRes.json();
          setApplications(data.applications);
        }
      } else {
        setSnackbar({ open: true, message: "Error al cancelar la postulación", severity: "error" });
      }
    } catch (error) {
      console.error("Error al cancelar la postulación:", error);
      setSnackbar({ open: true, message: "Error al cancelar la postulación", severity: "error" });
    } finally {
      setOpenCancelDialog(false);
      setSelectedCancelJobId(null);
    }
  };

  const handleDeleteJob = (jobId) => {
    setSelectedJobId(jobId);
    setOpenDeleteDialog(true);
  };

  const confirmDelete = async () => {
    try {
      const res = await fetch("/api/job/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId: selectedJobId }),
      });
      if (res.ok) {
        setSnackbar({ open: true, message: "Oferta eliminada correctamente.", severity: "success" });
        setJobs((prevJobs) => prevJobs.filter((job) => job.id !== selectedJobId));
      } else {
        setSnackbar({ open: true, message: "Error al eliminar la oferta.", severity: "error" });
      }
    } catch (error) {
      console.error("Error eliminando la oferta:", error);
      setSnackbar({ open: true, message: "Error al eliminar la oferta.", severity: "error" });
    } finally {
      setOpenDeleteDialog(false);
      setSelectedJobId(null);
    }
  };

  const cancelDelete = () => {
    setOpenDeleteDialog(false);
    setSelectedJobId(null);
  };

  return (
    <DashboardLayout>
      <Box sx={{ textAlign: "center", mt: 4, px: 2 }}>
        <Typography variant="h4" gutterBottom>
          Mis Ofertas
        </Typography>
        {jobs.length === 0 ? (
          <Typography variant="body1">No hay ofertas publicadas.</Typography>
        ) : (
          <Grid
            container
            spacing={3}
            sx={{ width: { xs: "100%", sm: "95%", md: "900px" }, mx: "auto" }}
          >
            {jobs.map((job) => (
              <Grid item xs={12} sm={6} md={4} key={job.id}>
                <Card sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
                  <CardContent sx={{ flexGrow: 1, p: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      {job.title}
                    </Typography>
                    <Typography variant="body2" color="error">
                      Expiración:{" "}
                      {job.expirationDate
                        ? new Date(job.expirationDate).toLocaleDateString()
                        : "Sin expiración"}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Publicado el:{" "}
                      {job.postedAt
                        ? new Date(job.postedAt).toLocaleDateString()
                        : "Sin fecha"}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 1 }}
                    >
                      Candidatos postulados: {job.candidatesCount || 0}
                      <PersonIcon fontSize="small" />
                    </Typography>
                  </CardContent>
                  <CardActions sx={{ justifyContent: "space-between", p: 2 }}>
                    <Button
                      component={Link}
                      href={`/job-offer?id=${job.id}`}
                      size="small"
                      variant="outlined"
                      color="primary"
                    >
                      Ver Detalles
                    </Button>
                    {session.user.role === "empleador" ? (
                      <Button
                        onClick={() => handleDeleteJob(job.id)}
                        size="small"
                        variant="contained"
                        color="secondary"
                      >
                        Eliminar
                      </Button>
                    ) : isApplied(job.id) ? (
                      <Button
                        onClick={() => handleRequestCancelApplication(job.id)}
                        size="small"
                        variant="contained"
                        color="secondary"
                      >
                        Cancelar Postulación
                      </Button>
                    ) : (
                      <Button
                        onClick={() => handleApply(job.id)}
                        size="small"
                        variant="contained"
                        color="primary"
                      >
                        Postularme
                      </Button>
                    )}
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
        <Divider sx={{ my: 3 }} />
        <Box sx={{ textAlign: "center", mt: 2 }}>
          <Button component={Link} href="/dashboard" variant="contained" color="primary">
            Volver al Dashboard
          </Button>
        </Box>
      </Box>

      <Dialog open={openCancelDialog} onClose={() => setOpenCancelDialog(false)}>
        <DialogTitle>Confirmar Cancelación</DialogTitle>
        <DialogContent>
          <Typography>¿Deseas cancelar tu postulación a este empleo?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCancelDialog(false)} color="primary">
            Cancelar
          </Button>
          <Button onClick={confirmCancelApplication} color="secondary" variant="contained">
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openDeleteDialog} onClose={cancelDelete}>
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <Typography>¿Estás seguro de que deseas eliminar esta oferta?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelDelete} color="primary">
            Cancelar
          </Button>
          <Button onClick={confirmDelete} color="secondary" variant="contained">
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

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
          sx={{
            width: "100%",
            bgcolor: (theme) =>
              snackbar.severity === "success"
                ? theme.palette.secondary.main
                : theme.palette.error.main,
            color: "#fff"
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </DashboardLayout>
  );
}
