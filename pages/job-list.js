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
  Alert,
} from "@mui/material";
import { useSession } from "next-auth/react";
import DashboardLayout from "../components/DashboardLayout";
import PersonIcon from "@mui/icons-material/Person";

export default function JobList() {
  const { data: session, status } = useSession();
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);

  // Estados para diálogos y notificaciones
  const [openCancelDialog, setOpenCancelDialog] = useState(false);
  const [selectedCancelJobId, setSelectedCancelJobId] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // URL base de tu API FastAPI
  const API_BASE =
    process.env.NEXT_PUBLIC_API_URL || "https://api.fapmendoza.online";

  // Construye encabezado con JWT de FastAPI (se asume que el login guardó el token en localStorage)
  const getAuthHeader = () => {
    const token = localStorage.getItem("userToken");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  useEffect(() => {
    async function fetchJobs() {
      try {
        const res = await fetch(`${API_BASE}/api/job`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        const now = new Date();
        setJobs(
          data.offers.filter(
            (job) => !job.expirationDate || new Date(job.expirationDate) > now
          )
        );
      } catch (error) {
        console.error("Error al obtener las ofertas:", error);
      }
    }

    async function fetchApplications() {
      if (session?.user?.role !== "empleado") return;
      try {
        const res = await fetch(`${API_BASE}/api/job/my-applications`, {
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeader(),
          },
        });
        if (!res.ok) throw new Error();
        const data = await res.json();
        setApplications(data.applications);
      } catch (error) {
        console.error("Error al obtener tus postulaciones:", error);
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
      const res = await fetch(`${API_BASE}/api/job/apply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader(),
        },
        body: JSON.stringify({ jobId }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || res.statusText);
      }

      updateJobCandidatesCount(jobId, 1);
      setSnackbar({
        open: true,
        message: "Has postulado exitosamente",
        severity: "success",
      });

      // Refrescar mis postulaciones
      const appRes = await fetch(`${API_BASE}/api/job/my-applications`, {
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader(),
        },
      });
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
      const res = await fetch(`${API_BASE}/api/job/cancel-application`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader(),
        },
        body: JSON.stringify({ jobId: selectedCancelJobId }),
      });
      if (res.ok) {
        updateJobCandidatesCount(selectedCancelJobId, -1);
        setSnackbar({
          open: true,
          message: "Postulación cancelada",
          severity: "success",
        });
        // Refrescar mis postulaciones
        const appRes = await fetch(`${API_BASE}/api/job/my-applications`, {
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeader(),
          },
        });
        if (appRes.ok) {
          const data = await appRes.json();
          setApplications(data.applications);
        }
      } else {
        setSnackbar({
          open: true,
          message: "Error al cancelar la postulación",
          severity: "error",
        });
      }
    } catch (error) {
      console.error("Error al cancelar la postulación:", error);
      setSnackbar({
        open: true,
        message: "Error al cancelar la postulación",
        severity: "error",
      });
    } finally {
      setOpenCancelDialog(false);
      setSelectedCancelJobId(null);
    }
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
                <Card
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    height: "100%",
                  }}
                >
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
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mt: 1 }}
                    >
                      Publicado el:{" "}
                      {job.postedAt
                        ? new Date(job.postedAt).toLocaleDateString()
                        : "Sin fecha"}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                        mt: 1,
                      }}
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
                    {session?.user?.role === "empleador" ? (
                      <Button
                        onClick={() => {
                          /* lógica para eliminar oferta, si aplica */
                        }}
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
          <Button
            component={Link}
            href="/dashboard"
            variant="contained"
            color="primary"
          >
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
          <Button
            onClick={() => setOpenCancelDialog(false)}
            color="primary"
          >
            Cancelar
          </Button>
          <Button
            onClick={confirmCancelApplication}
            color="secondary"
            variant="contained"
          >
            Confirmar
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
            color: "#fff",
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </DashboardLayout>
  );
}
