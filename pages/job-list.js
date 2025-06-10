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

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://api.fapmendoza.online";

export default function JobList() {
  // 1) Autenticación
  const { user, role: userRole, token: sessionToken, ready } = useAuthUser();
  const userId = user?.id || null;

  // 1b) Token localStorage
  const [localToken, setLocalToken] = useState(null);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const t = localStorage.getItem("userToken");
    if (t) {
      console.log("[JobList] token localStorage encontrado");
      setLocalToken(t);
    }
  }, []);

  // Combinamos NextAuth y localToken
  const authToken = sessionToken || localToken;
  const authHeader = useCallback(
    () => (authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    [authToken]
  );

  // 2) State
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [loadingApps, setLoadingApps] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [dialogs, setDialogs] = useState({
    delete: { open: false, jobId: null },
    cancel: { open: false, jobId: null },
  });

  // 3) fetchJobs
  const fetchJobs = useCallback(async () => {
    setLoadingJobs(true);
    try {
      let url = `${API_BASE}/api/job/`;
      if (userRole === "empleador" && userId) url += `?userId=${userId}`;
      console.log("[JobList] GET ofertas →", url);
      const res = await fetch(url, {
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const { offers } = await res.json();
      setJobs(offers);
    } catch (e) {
      console.error("[JobList] fetchJobs error:", e);
      setSnackbar({ open: true, message: "Error cargando ofertas", severity: "error" });
    } finally {
      setLoadingJobs(false);
    }
  }, [userRole, userId]);

  // 4) fetchApps
  const fetchApps = useCallback(async () => {
    if (userRole !== "empleado" || !authToken) {
      setApplications([]);
      return;
    }
    setLoadingApps(true);
    try {
      const url = `${API_BASE}/api/job/my-applications`;
      console.log("[JobList] GET postulaciones →", url);
      const res = await fetch(url, {
        headers: { "Content-Type": "application/json", ...authHeader() },
      });
      if (res.status === 401) {
        console.warn("[JobList] token expirado");
        localStorage.removeItem("userToken");
        setLocalToken(null);
        setApplications([]);
      } else if (res.ok) {
        const { applications: apps } = await res.json();
        setApplications(apps);
      } else {
        console.error("[JobList] fetchApps status:", res.status);
      }
    } catch (e) {
      console.error("[JobList] fetchApps exception:", e);
      setSnackbar({ open: true, message: "Error cargando postulaciones", severity: "error" });
    } finally {
      setLoadingApps(false);
    }
  }, [userRole, authToken]);

  // 5) Efectos iniciales
  useEffect(() => { if (ready) fetchJobs(); }, [ready, fetchJobs]);
  useEffect(() => { if (ready) fetchApps(); }, [ready, fetchApps]);

  // 6) Helpers
  const isApplied = (jobId) => applications.some((a) => a.jobId === jobId);
  const bumpCount = (jobId, delta) =>
    setJobs((prev) =>
      prev.map((j) =>
        j.id === jobId
          ? { ...j, candidatesCount: (j.candidatesCount ?? 0) + delta }
          : j
      )
    );

  // 7) Postular
  const handleApply = async (jobId) => {
    if (!authToken) {
      setSnackbar({ open: true, message: "Inicia sesión para postular", severity: "error" });
      return;
    }
    try {
      console.log("[JobList] POST apply →", jobId);
      const res = await fetch(`${API_BASE}/api/job/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader() },
        body: JSON.stringify({ jobId }),
      });
      if (!res.ok) throw new Error();
      setSnackbar({ open: true, message: "Postulado exitosamente", severity: "success" });
      await fetchApps();
      await fetchJobs();
    } catch {
      setSnackbar({ open: true, message: "Error al postular", severity: "error" });
    }
  };

  // 8) Cancelar
  const confirmCancel = async () => {
    const { jobId } = dialogs.cancel;
    if (!authToken) {
      setDialogs({ ...dialogs, cancel: { open: false, jobId: null } });
      return;
    }
    try {
      console.log("[JobList] DELETE cancel →", jobId);
      const res = await fetch(`${API_BASE}/api/job/cancel-application`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json", ...authHeader() },
        body: JSON.stringify({ jobId }),
      });
      if (!res.ok) throw new Error();
      setSnackbar({ open: true, message: "Cancelado", severity: "success" });
      await fetchApps();
      await fetchJobs();
    } catch {
      setSnackbar({ open: true, message: "Error al cancelar", severity: "error" });
    } finally {
      setDialogs({ ...dialogs, cancel: { open: false, jobId: null } });
    }
  };

  // 9) Render
  if (!ready) {
    return <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}><CircularProgress /></Box>;
  }

  return (
    <DashboardLayout>
      <Box sx={{ mt: 4, textAlign: "center", px: 2 }}>
        <Typography variant="h4" gutterBottom>Listado de Ofertas</Typography>

        {loadingJobs ? (
          <CircularProgress />
        ) : jobs.length === 0 ? (
          <Typography>No hay ofertas publicadas.</Typography>
        ) : (
          <Grid container spacing={3} sx={{ mx: "auto", maxWidth: 900 }}>
            {jobs.map((job) => (
              <Grid item xs={12} sm={6} md={4} key={job.id}>
                <Card sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6">{job.title}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt:1, display:"flex", alignItems:"center", gap:0.5 }}>
                      Candidatos postulados: {job.candidatesCount ?? 0} <PersonIcon fontSize="small"/>
                    </Typography>
                  </CardContent>
                  <CardActions sx={{ justifyContent: "space-between" }}>
                    <Button component={Link} href={`/job-offer?id=${job.id}`}>Ver Detalles</Button>
                    {!authToken ? (
                      <Button disabled>Iniciar sesión</Button>
                    ) : isApplied(job.id) ? (
                      <Button color="secondary" onClick={() => setDialogs({ ...dialogs, cancel: { open: true, jobId: job.id } })}>
                        Cancelar Postulación
                      </Button>
                    ) : (
                      <Button onClick={() => handleApply(job.id)}>Postularme</Button>
                    )}
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        <Divider sx={{ my: 3 }} />
        <Button component={Link} href="/dashboard" variant="contained">Volver al Dashboard</Button>
      </Box>

      {/* Confirmación Cancelar */}
      <Dialog
        open={dialogs.cancel.open}
        onClose={() => setDialogs({ ...dialogs, cancel: { open: false, jobId: null } })}
      >
        <DialogTitle>Confirmar Cancelación</DialogTitle>
        <DialogContent>¿Deseas cancelar tu postulación?</DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogs({ ...dialogs, cancel: { open: false, jobId: null } })}>
            Volver
          </Button>
          <Button color="secondary" onClick={confirmCancel}>Confirmar</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </DashboardLayout>
  );
}
