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
  CircularProgress,
} from "@mui/material";
import { useSession } from "next-auth/react";
import DashboardLayout from "../components/DashboardLayout";
import PersonIcon from "@mui/icons-material/Person";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://api.fapmendoza.online";

export default function JobList() {
  const { data: session, status } = useSession();
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [dialogs, setDialogs] = useState({
    delete: { open: false, jobId: null },
    cancel: { open: false, jobId: null },
  });

  // Extraer userId desde el token si no hay sesión de NextAuth
  let fallbackUserId = null;
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("userToken");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        fallbackUserId = payload.sub;
      } catch (e) {
        console.error("Token inválido", e);
      }
    }
  }

  const userId = session?.user?.id || fallbackUserId;
  const userRole = session?.user?.role || (fallbackUserId ? "empleado" : null);

  // Construye el header de autorización con el JWT guardado en localStorage
  const authHeader = () => {
    if (typeof window === "undefined") return {};
    const token = localStorage.getItem("userToken");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  useEffect(() => {
    if (status === "loading") return;

    const fetchAll = async () => {
      setLoading(true);
      try {
        // 1) Obtener ofertas vigentes
        let jobsUrl = `${API_BASE}/api/job/`;
        if (userRole === "empleador") {
          jobsUrl += `?userId=${userId}`;
        }
        const resJobs = await fetch(jobsUrl, {
          headers: { "Content-Type": "application/json", ...authHeader() },
        });
        if (resJobs.ok) {
          const dataJobs = await resJobs.json();
          const now = new Date();
          setJobs(
            dataJobs.offers.filter(
              (job) => !job.expirationDate || new Date(job.expirationDate) > now
            )
          );
        } else {
          console.error("Error al obtener las ofertas");
        }

        // 2) Obtener postulaciones del usuario (solo si es empleado)
        if (userRole === "empleado") {
          const resApps = await fetch(`${API_BASE}/api/job/my-applications`, {
            headers: { "Content-Type": "application/json", ...authHeader() },
          });
          if (resApps.ok) {
            const dataApps = await resApps.json();
            setApplications(dataApps.applications);
          } else {
            console.error("Error al obtener tus postulaciones");
          }
        }
      } catch (err) {
        console.error("Error fetchAll:", err);
        setSnackbar({ open: true, message: "Error cargando datos", severity: "error" });
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [status]);

  const isApplied = (jobId) => applications.some((app) => app.jobId === jobId);

  const bumpCount = (jobId, delta) => {
    setJobs((prev) =>
      prev.map((job) =>
        job.id === jobId
          ? { ...job, candidatesCount: (job.candidatesCount || 0) + delta }
          : job
      )
    );
  };

  const handleApply = async (jobId) => {
    try {
      // 1) Postulación en Next.js API (requiere que el usuario esté logueado en NextAuth)
      const res = await fetch("/api/job/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || res.statusText);
      }

      bumpCount(jobId, 1);
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
          applicant_id: userId,
          label: "automatic",
        }),
      });

      // 3) Refrescar mis postulaciones
      const resApps = await fetch(`${API_BASE}/api/job/my-applications`, {
        headers: { "Content-Type": "application/json", ...authHeader() },
      });
      if (resApps.ok) {
        const dataApps = await resApps.json();
        setApplications(dataApps.applications);
      }
    } catch (err) {
      console.error("Error al postular:", err);
      setSnackbar({ open: true, message: `Error al postular: ${err.message}`, severity: "error" });
    }
  };

  const handleRequestCancel = (jobId) => {
    setDialogs((d) => ({ ...d, cancel: { open: true, jobId } }));
  };

  const confirmCancel = async () => {
    const jobId = dialogs.cancel.jobId;
    try {
      const res = await fetch(`${API_BASE}/api/job/cancel-application`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json", ...authHeader() },
        body: JSON.stringify({ jobId }),
      });
      if (res.ok) {
        bumpCount(jobId, -1);
        setSnackbar({ open: true, message: "Postulación cancelada", severity: "success" });
        const resApps = await fetch(`${API_BASE}/api/job/my-applications`, {
          headers: { "Content-Type": "application/json", ...authHeader() },
        });
        if (resApps.ok) {
          const dataApps = await resApps.json();
          setApplications(dataApps.applications);
        }
      } else {
        setSnackbar({ open: true, message: "Error al cancelar la postulación", severity: "error" });
      }
    } catch (err) {
      console.error("Error al cancelar:", err);
      setSnackbar({ open: true, message: "Error al cancelar la postulación", severity: "error" });
    } finally {
      setDialogs((d) => ({ ...d, cancel: { open: false, jobId: null } }));
    }
  };

  const handleDelete = (jobId) => {
    setDialogs((d) => ({ ...d, delete: { open: true, jobId } }));
  };

  const confirmDelete = async () => {
    const jobId = dialogs.delete.jobId;
    try {
      const res = await fetch(`${API_BASE}/api/job/delete`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
        body: JSON.stringify({ jobId }),
      });
      if (res.ok) {
        setSnackbar({ open: true, message: "Oferta eliminada correctamente", severity: "success" });
        setJobs((prev) => prev.filter((j) => j.id !== jobId));
      } else {
        setSnackbar({ open: true, message: "Error al eliminar la oferta", severity: "error" });
      }
    } catch (err) {
      console.error("Error eliminando oferta:", err);
      setSnackbar({ open: true, message: "Error al eliminar la oferta", severity: "error" });
    } finally {
      setDialogs((d) => ({ ...d, delete: { open: false, jobId: null } }));
    }
  };

  return (
    <DashboardLayout>
      <Box sx={{ textAlign: "center", mt: 4, px: 2 }}>
        <Typography variant="h4" gutterBottom>
          Listado de Ofertas
        </Typography>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : jobs.length === 0 ? (
          <Typography variant="body1">No hay ofertas publicadas.</Typography>
        ) : (
          <Grid container spacing={3} sx={{ mx: "auto", width: { md: "900px" } }}>
            {jobs.map((job) => (
              <Grid item xs={12} sm={6} md={4} key={job.id}>
                <Card sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
                  <CardContent sx={{ flexGrow: 1, p: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      {job.title}
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
                    <Button component={Link} href={`/job-offer?id=${job.id}`} size="small">
                      Ver Detalles
                    </Button>

                    {userRole === "empleador" ? (
                      <Button size="small" variant="contained" color="secondary" onClick={() => handleDelete(job.id)}>
                        Eliminar
                      </Button>
                    ) : isApplied(job.id) ? (
                      <Button size="small" variant="contained" color="secondary" onClick={() => handleRequestCancel(job.id)}>
                        Cancelar Postulación
                      </Button>
                    ) : userId ? (
                      <Button size="small" variant="contained" color="primary" onClick={() => handleApply(job.id)}>
                        Postularme
                      </Button>
                    ) : (
                      <Button size="small" variant="outlined" color="primary" disabled>
                        Iniciar sesión para postular
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

      {/* Diálogo Confirmar Cancelación */}
      <Dialog
        open={dialogs.cancel.open}
        onClose={() => setDialogs((d) => ({ ...d, cancel: { open: false, jobId: null } }))}
      >
        <DialogTitle>Confirmar Cancelación</DialogTitle>
        <DialogContent>
          <Typography>¿Deseas cancelar tu postulación a este empleo?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogs((d) => ({ ...d, cancel: { open: false, jobId: null } }))} color="primary">
            Cancelar
          </Button>
          <Button onClick={confirmCancel} color="secondary" variant="contained">
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo Confirmar Eliminación */}
      <Dialog
        open={dialogs.delete.open}
        onClose={() => setDialogs((d) => ({ ...d, delete: { open: false, jobId: null } }))}
      >
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <Typography>¿Estás seguro de que deseas eliminar esta oferta?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogs((d) => ({ ...d, delete: { open: false, jobId: null } }))} color="primary">
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
            color: "#fff",
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </DashboardLayout>
  );
}
