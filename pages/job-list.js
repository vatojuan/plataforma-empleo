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

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "https://api.fapmendoza.online";

export default function JobList() {
  /* ────────────────────────────────
      1. Autenticación y estado
  ──────────────────────────────────*/
  const { data: session, status } = useSession();
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [dialogs, setDialogs] = useState({
    delete: { open: false, jobId: null },
    cancel: { open: false, jobId: null },
  });

  /* ────────────────────────────────
      1-A  Fallback a JWT propio
  ──────────────────────────────────*/
  let fallbackUserId: string | null = null;
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("userToken");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        fallbackUserId = payload.sub;
      } catch {
        /* token corrupto → lo limpiamos */
        localStorage.removeItem("userToken");
      }
    }
  }

  const userId = session?.user?.id || fallbackUserId;
  const userRole =
    session?.user?.role || (fallbackUserId ? "empleado" : undefined);

  const authHeader = () => {
    if (typeof window === "undefined") return {};
    const t = localStorage.getItem("userToken");
    return t ? { Authorization: `Bearer ${t}` } : {};
  };

  /* ────────────────────────────────
      2. Cargar ofertas y postulaciones
  ──────────────────────────────────*/
  useEffect(() => {
    if (status === "loading") return;

    const fetchAll = async () => {
      setLoading(true);
      try {
        /* Ofertas vigentes */
        let url = `${API_BASE}/api/job/`;
        if (userRole === "empleador") url += `?userId=${userId}`;

        const resJobs = await fetch(url, {
          headers: { "Content-Type": "application/json", ...authHeader() },
        });
        if (resJobs.ok) {
          const { offers } = await resJobs.json();
          const now = new Date();
          setJobs(
            offers.filter(
              (j: any) =>
                !j.expirationDate || new Date(j.expirationDate) > now
            )
          );
        }

        /* Postulaciones (solo empleado con token válido) */
        if (userRole === "empleado" && localStorage.getItem("userToken")) {
          const resApps = await fetch(
            `${API_BASE}/api/job/my-applications`,
            {
              headers: {
                "Content-Type": "application/json",
                ...authHeader(),
              },
            }
          );

          if (resApps.status === 401) {
            // JWT expirado → limpiamos y forzamos reload
            localStorage.removeItem("userToken");
            setApplications([]);
          } else if (resApps.ok) {
            const { applications } = await resApps.json();
            setApplications(applications);
          }
        }
      } catch (e) {
        console.error(e);
        setSnackbar({
          open: true,
          message: "Error cargando datos",
          severity: "error",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [status, userRole, userId]);

  /* ────────────────────────────────
      3. Helpers
  ──────────────────────────────────*/
  const isApplied = (id: number) =>
    applications.some((a) => a.jobId === id);

  const bumpCount = (id: number, delta: number) =>
    setJobs((prev) =>
      prev.map((j) =>
        j.id === id
          ? { ...j, candidatesCount: (j.candidatesCount || 0) + delta }
          : j
      )
    );

  /* ────────────────────────────────
      4. Postular
  ──────────────────────────────────*/
  const handleApply = async (jobId: number) => {
    try {
      const res = await fetch("/api/job/apply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("userToken")}`,
        },
        body: JSON.stringify({ jobId }),
      });
      if (!res.ok) {
        throw new Error((await res.json()).error || res.statusText);
      }

      /* Optimista */
      bumpCount(jobId, 1);
      setApplications((prev) => [
        ...prev,
        { jobId, status: "sent", createdAt: new Date().toISOString() },
      ]);
      setSnackbar({
        open: true,
        message: "Has postulado exitosamente",
        severity: "success",
      });

      /* Confirmar estado real */
      const resApps = await fetch(`${API_BASE}/api/job/my-applications`, {
        headers: { "Content-Type": "application/json", ...authHeader() },
      });
      if (resApps.ok) {
        const { applications } = await resApps.json();
        setApplications(applications);
      }
    } catch (e: any) {
      setSnackbar({
        open: true,
        message: `Error al postular: ${e.message}`,
        severity: "error",
      });
    }
  };

  /* ────────────────────────────────
      5. Cancelar postulación
  ──────────────────────────────────*/
  const confirmCancel = async () => {
    const id = dialogs.cancel.jobId;
    try {
      const res = await fetch(
        `${API_BASE}/api/job/cancel-application`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json", ...authHeader() },
          body: JSON.stringify({ jobId: id }),
        }
      );

      if (res.ok) {
        bumpCount(id, -1);
        setApplications((prev) => prev.filter((a) => a.jobId !== id));
        setSnackbar({
          open: true,
          message: "Postulación cancelada",
          severity: "success",
        });
      } else {
        setSnackbar({
          open: true,
          message: "Error al cancelar la postulación",
          severity: "error",
        });
      }
    } catch {
      setSnackbar({
        open: true,
        message: "Error al cancelar la postulación",
        severity: "error",
      });
    } finally {
      setDialogs((d) => ({ ...d, cancel: { open: false, jobId: null } }));
    }
  };

  /* ────────────────────────────────
      6. Eliminar oferta (empleador)
  ──────────────────────────────────*/
  const confirmDelete = async () => {
    const id = dialogs.delete.jobId;
    try {
      const res = await fetch(`${API_BASE}/api/job/delete`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
        body: JSON.stringify({ jobId: id }),
      });
      if (res.ok) {
        setJobs((prev) => prev.filter((j) => j.id !== id));
        setSnackbar({
          open: true,
          message: "Oferta eliminada correctamente",
          severity: "success",
        });
      } else {
        setSnackbar({
          open: true,
          message: "Error al eliminar la oferta",
          severity: "error",
        });
      }
    } finally {
      setDialogs((d) => ({ ...d, delete: { open: false, jobId: null } }));
    }
  };

  /* ────────────────────────────────
      7. Render
  ──────────────────────────────────*/
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
          <Typography>No hay ofertas publicadas.</Typography>
        ) : (
          <Grid container spacing={3} sx={{ mx: "auto", width: { md: "900px" } }}>
            {jobs.map((job) => (
              <Grid item xs={12} sm={6} md={4} key={job.id}>
                <Card sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6">{job.title}</Typography>
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
                      <Button
                        size="small"
                        variant="contained"
                        color="secondary"
                        onClick={() =>
                          setDialogs((d) => ({ ...d, delete: { open: true, jobId: job.id } }))
                        }
                      >
                        Eliminar
                      </Button>
                    ) : isApplied(job.id) ? (
                      <Button
                        size="small"
                        variant="contained"
                        color="secondary"
                        onClick={() =>
                          setDialogs((d) => ({ ...d, cancel: { open: true, jobId: job.id } }))
                        }
                      >
                        Cancelar Postulación
                      </Button>
                    ) : userId ? (
                      <Button
                        size="small"
                        variant="contained"
                        color="primary"
                        onClick={() => handleApply(job.id)}
                      >
                        Postularme
                      </Button>
                    ) : (
                      <Button size="small" variant="outlined" disabled>
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

        <Box sx={{ textAlign: "center" }}>
          <Button component={Link} href="/dashboard" variant="contained">
            Volver al Dashboard
          </Button>
        </Box>
      </Box>

      {/* ── Dialog cancelación ─────────────────────────────── */}
      <Dialog
        open={dialogs.cancel.open}
        onClose={() =>
          setDialogs((d) => ({ ...d, cancel: { open: false, jobId: null } }))
        }
      >
        <DialogTitle>Confirmar Cancelación</DialogTitle>
        <DialogContent>
          <Typography>¿Deseas cancelar tu postulación a este empleo?</Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() =>
              setDialogs((d) => ({ ...d, cancel: { open: false, jobId: null } }))
            }
          >
            Volver
          </Button>
          <Button onClick={confirmCancel} color="secondary" variant="contained">
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Dialog eliminar ────────────────────────────────── */}
      <Dialog
        open={dialogs.delete.open}
        onClose={() =>
          setDialogs((d) => ({ ...d, delete: { open: false, jobId: null } }))
        }
      >
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <Typography>¿Seguro que deseas eliminar esta oferta?</Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() =>
              setDialogs((d) => ({ ...d, delete: { open: false, jobId: null } }))
            }
          >
            Volver
          </Button>
          <Button onClick={confirmDelete} color="secondary" variant="contained">
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Snackbar global ────────────────────────────────── */}
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
    </DashboardLayout>
  );
}
