// pages/job-list.js

import { useEffect, useState, useCallback } from "react";
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
import PersonIcon from "@mui/icons-material/Person";
import useAuthUser from "../hooks/useAuthUser";
import DashboardLayout from "../components/DashboardLayout";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "https://api.fapmendoza.online";

export default function JobList() {
  // 1) Autenticación centralizada
  const {
    user,
    role: userRole,
    token: sessionToken,
    authHeader: getNextAuthHeader,
    ready,
  } = useAuthUser();
  const userId = user?.id || null;

  // 1b) Intentamos también leer token guardado en localStorage
  const [localToken, setLocalToken] = useState(null);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const t = localStorage.getItem("userToken");
    if (t) {
      console.log("[JobList] localStorage userToken encontrado");
      setLocalToken(t);
    }
  }, []);

  // Usa sesión NextAuth o token de localStorage
  const authToken = sessionToken || localToken;
  const authHeader = useCallback(() => {
    if (!authToken) return {};
    return { Authorization: `Bearer ${authToken}` };
  }, [authToken]);

  // 2) Estado local
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [loadingApps, setLoadingApps] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [dialogs, setDialogs] = useState({
    delete: { open: false, jobId: null },
    cancel: { open: false, jobId: null },
  });

  // 4) Cargar ofertas (públicas o propias si es empleador)
  useEffect(() => {
    if (!ready) return;
    const fetchJobs = async () => {
      setLoadingJobs(true);
      try {
        let url = `${API_BASE}/api/job/`;
        if (userRole === "empleador" && userId) {
          url += `?userId=${userId}`;
        }
        const res = await fetch(url, {
          headers: { "Content-Type": "application/json" },
        });
        if (!res.ok) throw new Error(`Status ${res.status}`);
        const { offers } = await res.json();
        const now = new Date();
        setJobs(
          offers.filter((j) =>
            !j.expirationDate || new Date(j.expirationDate) > now
          )
        );
      } catch (e) {
        console.error("[JobList] fetchJobs error:", e);
        setSnackbar({
          open: true,
          message: "Error cargando ofertas",
          severity: "error",
        });
      } finally {
        setLoadingJobs(false);
      }
    };
    fetchJobs();
  }, [ready, userRole, userId]);

  // 5) Cargar postulaciones (solo empleado + token disponible)
  useEffect(() => {
    if (!ready) return;
    if (userRole !== "empleado" || !authToken) {
      setApplications([]);
      return;
    }
    const fetchApps = async () => {
      setLoadingApps(true);
      try {
        const url = `${API_BASE}/api/job/my-applications`;
        const res = await fetch(url, {
          headers: { "Content-Type": "application/json", ...authHeader() },
        });
        if (res.status === 401) {
          localStorage.removeItem("userToken");
          setLocalToken(null);
          setApplications([]);
        } else if (res.ok) {
          const { applications: apps } = await res.json();
          setApplications(apps);
        }
      } catch (e) {
        console.error("[JobList] fetchApps error:", e);
        setSnackbar({
          open: true,
          message: "Error cargando tus postulaciones",
          severity: "error",
        });
      } finally {
        setLoadingApps(false);
      }
    };
    fetchApps();
  }, [ready, userRole, authToken]);

  // 6) Helpers
  const getApplicationForJob = (jobId) =>
    applications.find((a) => a.jobId === jobId);
  const bumpCount = (jobId, delta) =>
    setJobs((prev) =>
      prev.map((j) =>
        j.id === jobId
          ? { ...j, candidatesCount: (j.candidatesCount || 0) + delta }
          : j
      )
    );

  // 7) Postular a oferta
  const handleApply = async (jobId) => {
    if (!authToken) {
      setSnackbar({
        open: true,
        message: "Debes iniciar sesión para postular",
        severity: "error",
      });
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/api/job/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader() },
        body: JSON.stringify({ jobId }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || `${res.status}`);
      }
      // Optimista
      bumpCount(jobId, 1);
      setSnackbar({
        open: true,
        message: "Has postulado exitosamente",
        severity: "success",
      });
      // re-fetch apps
      const appsRes = await fetch(`${API_BASE}/api/job/my-applications`, {
        headers: { "Content-Type": "application/json", ...authHeader() },
      });
      if (appsRes.ok) {
        const { applications: apps } = await appsRes.json();
        setApplications(apps);
      }
    } catch (e) {
      console.error("[JobList] handleApply error:", e);
      setSnackbar({
        open: true,
        message: "Error al postular",
        severity: "error",
      });
    }
  };

  // 8) Cancelar postulación
  const confirmCancel = async () => {
    const id = dialogs.cancel.jobId;
    if (!authToken) {
      setSnackbar({
        open: true,
        message: "Debes iniciar sesión para cancelar",
        severity: "error",
      });
      setDialogs((d) => ({ ...d, cancel: { open: false, jobId: null } }));
      return;
    }
    try {
      const res = await fetch(
        `${API_BASE}/api/job/cancel-application`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json", ...authHeader() },
          body: JSON.stringify({ jobId: id }),
        }
      );
      if (!res.ok) throw new Error(`${res.status}`);
      bumpCount(id, -1);
      setApplications((apps) => apps.filter((a) => a.jobId !== id));
      setSnackbar({
        open: true,
        message: "Postulación cancelada",
        severity: "success",
      });
    } catch (e) {
      console.error("[JobList] confirmCancel error:", e);
      setSnackbar({
        open: true,
        message: "Error al cancelar",
        severity: "error",
      });
    } finally {
      setDialogs((d) => ({ ...d, cancel: { open: false, jobId: null } }));
    }
  };

  // 9) Eliminar oferta (empleador)
  const confirmDelete = async () => {
    const id = dialogs.delete.jobId;
    const adminToken = localStorage.getItem("adminToken");
    if (!adminToken) {
      setSnackbar({
        open: true,
        message: "No autorizado",
        severity: "error",
      });
      setDialogs((d) => ({ ...d, delete: { open: false, jobId: null } }));
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/api/job/delete`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ jobId: id }),
      });
      if (!res.ok) throw new Error(`${res.status}`);
      setJobs((prev) => prev.filter((j) => j.id !== id));
      setSnackbar({
        open: true,
        message: "Oferta eliminada correctamente",
        severity: "success",
      });
    } catch (e) {
      console.error("[JobList] confirmDelete error:", e);
      setSnackbar({
        open: true,
        message: "Error al eliminar la oferta",
        severity: "error",
      });
    } finally {
      setDialogs((d) => ({ ...d, delete: { open: false, jobId: null } }));
    }
  };

  // 10) Spinner mientras no esté listo
  if (!ready) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  // 11) Render final
  return (
    <DashboardLayout>
      <Box sx={{ textAlign: "center", mt: 4, px: 2 }}>
        <Typography variant="h4" gutterBottom>
          Listado de Ofertas
        </Typography>

        {loadingJobs ? (
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
                    ) : (() => {
                        const app = getApplicationForJob(job.id);
                        // Si no se ha postulado todavía
                        if (!app) {
                          return (
                            <Button
                              size="small"
                              variant="contained"
                              color="primary"
                              onClick={() => handleApply(job.id)}
                            >
                              Postularme
                            </Button>
                          );
                        }
                        // Si está en waiting o pending => cancelar
                        const isCancelable =
                          (app.label === "automatic" && app.status === "waiting") ||
                          (app.label === "manual"    && app.status === "pending");
                        if (isCancelable) {
                          return (
                            <Button
                              size="small"
                              variant="contained"
                              color="secondary"
                              onClick={() =>
                                setDialogs((d) => ({
                                  ...d,
                                  cancel: { open: true, jobId: job.id },
                                }))
                              }
                            >
                              Cancelar Postulación
                            </Button>
                          );
                        }
                        // Si ya se envió
                        return (
                          <Button size="small" variant="outlined" disabled>
                            Propuesta enviada
                          </Button>
                        );
                      })()}
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

      {/* Dialog Confirmar Cancelación */}
      <Dialog
        open={dialogs.cancel.open}
        onClose={() => setDialogs((d) => ({ ...d, cancel: { open: false, jobId: null } }))}
      >
        <DialogTitle>Confirmar Cancelación</DialogTitle>
        <DialogContent>
          <Typography>¿Deseas cancelar tu postulación a este empleo?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogs((d) => ({ ...d, cancel: { open: false, jobId: null } }))}>
            Volver
          </Button>
          <Button onClick={confirmCancel} color="secondary" variant="contained">
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Confirmar Eliminación */}
      <Dialog
        open={dialogs.delete.open}
        onClose={() => setDialogs((d) => ({ ...d, delete: { open: false, jobId: null } }))}
      >
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <Typography>¿Seguro que deseas eliminar esta oferta?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogs((d) => ({ ...d, delete: { open: false, jobId: null } }))}>
            Volver
          </Button>
          <Button onClick={confirmDelete} color="secondary" variant="contained">
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar global */}
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
