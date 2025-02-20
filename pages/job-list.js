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

  // Estados para diálogos
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [openCancelDialog, setOpenCancelDialog] = useState(false);
  const [selectedCancelJobId, setSelectedCancelJobId] = useState(null);

  // Snackbar para notificaciones
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

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
          setJobs(data.jobs);
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

  // Función para determinar si el empleado ya ha postulado
  const isApplied = (jobId) => {
    return applications.some((app) => app.jobId === jobId);
  };

  // Función para actualizar el conteo de candidatos en el estado local
  const updateJobCandidatesCount = (jobId, change) => {
    setJobs((prevJobs) =>
      prevJobs.map((job) =>
        job.id === jobId
          ? { ...job, candidatesCount: (job.candidatesCount || 0) + change }
          : job
      )
    );
  };

  // Función para postularse
  const handleApply = async (jobId) => {
    try {
      const res = await fetch("/api/job/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId }),
      });
      if (res.ok) {
        setSnackbar({ open: true, message: "Has postulado exitosamente", severity: "success" });
        // Actualizamos el conteo local
        updateJobCandidatesCount(jobId, 1);
        // También actualizamos el listado de postulaciones
        const appRes = await fetch("/api/job/my-applications");
        if (appRes.ok) {
          const data = await appRes.json();
          setApplications(data.applications);
        }
      } else {
        const errorData = await res.json();
        setSnackbar({ open: true, message: "Error: " + errorData.error, severity: "error" });
      }
    } catch (error) {
      console.error("Error al postular:", error);
      setSnackbar({ open: true, message: "Error al postular", severity: "error" });
    }
  };

  // Función para cancelar la postulación
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
        setSnackbar({ open: true, message: "Postulación cancelada", severity: "success" });
        // Actualizamos el conteo local
        updateJobCandidatesCount(selectedCancelJobId, -1);
        // Actualizamos el listado de postulaciones
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

  const cancelCancelApplication = () => {
    setOpenCancelDialog(false);
    setSelectedCancelJobId(null);
  };

  // Función para eliminar oferta (para empleador)
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
      <Box sx={{ textAlign: "center", mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Mis Ofertas
        </Typography>
        {jobs.length === 0 ? (
          <Typography variant="body1">No hay ofertas publicadas.</Typography>
        ) : (
          <Grid container spacing={3} sx={{ maxWidth: 900, mx: "auto" }}>
            {jobs.map((job) => (
              <Grid item xs={12} sm={6} md={4} key={job.id}>
                <Card sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" gutterBottom>
                      {job.title}
                    </Typography>
                    {job.requirements && (
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Requisitos: {job.requirements}
                      </Typography>
                    )}
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
                    >
                      <span>
                        Publicado el:{" "}
                        {job.postedAt ? new Date(job.postedAt).toLocaleDateString() : "Sin fecha"}
                      </span>
                      <span style={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        {/* Opcional: agregar ícono adicional */}
                      </span>
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
                  <CardActions sx={{ justifyContent: "space-between" }}>
                    <Button
                      component={Link}
                      href={`/job-offer?id=${job.id}`}
                      size="small"
                      variant="outlined"
                      color="primary"
                    >
                      Ver Detalles
                    </Button>
                    {session.user.role === "empleado" ? (
                      <>
                        {isApplied(job.id) ? (
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
                      </>
                    ) : (
                      <Button
                        onClick={() => handleDeleteJob(job.id)}
                        size="small"
                        variant="contained"
                        color="secondary"
                      >
                        Eliminar
                      </Button>
                    )}
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

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

      <Dialog open={openCancelDialog} onClose={cancelCancelApplication}>
        <DialogTitle>Confirmar Cancelación</DialogTitle>
        <DialogContent>
          <Typography>¿Deseas cancelar tu postulación a este empleo?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelCancelApplication} color="primary">
            Cancelar
          </Button>
          <Button onClick={confirmCancelApplication} color="secondary" variant="contained">
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>

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
          sx={{
            width: "100%",
            bgcolor: (theme) =>
              snackbar.severity === "success"
                ? theme.palette.secondary.main
                : snackbar.severity === "error"
                ? theme.palette.error.main
                : theme.palette.info.main,
            color: "#fff"
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </DashboardLayout>
  );
}
