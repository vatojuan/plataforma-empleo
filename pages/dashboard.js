// pages/dashboard.js

import { useRouter } from "next/router";
import { signOut, getSession } from "next-auth/react";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import useAuthUser from "../hooks/useAuthUser";
import DashboardLayout from "../components/DashboardLayout";
import {
  Box,
  Paper,
  Typography,
  Button,
  Avatar,
  Grid,
  Card,
  CardContent,
  CardActions,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://api.fapmendoza.online";

export default function Dashboard({ toggleDarkMode, currentMode }) {
  /* ────────────────────────────────
      1. Autenticación centralizada
  ──────────────────────────────────*/
  const { user, role: userRole, token, authHeader, ready, sessionStatus } = useAuthUser();
  const router = useRouter();

  /* ────────────────────────────────
      2. Estado local
  ──────────────────────────────────*/
  const [applications, setApplications] = useState([]);
  const [profileImageUrl, setProfileImageUrl] = useState("/images/default-user.png");
  const [openCancelDialog, setOpenCancelDialog] = useState(false);
  const [selectedCancelJobId, setSelectedCancelJobId] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  /* ────────────────────────────────
      3. Forzar revalidación de sesión
  ──────────────────────────────────*/
  useEffect(() => {
    async function refresh() {
      await getSession();
    }
    refresh();
  }, []);

  /* ────────────────────────────────
      4. Actualizar imagen de perfil
  ──────────────────────────────────*/
  useEffect(() => {
    if (user?.image) {
      setProfileImageUrl(user.image);
    }
  }, [user]);

  const handleImageError = async () => {
    try {
      const endpoint =
        userRole === "empleado"
          ? "/api/employee/renew-profile-picture"
          : "/api/employer/renew-profile-picture";
      const res = await fetch(endpoint);
      const data = await res.json();
      if (data.url) {
        setProfileImageUrl(data.url);
      }
    } catch (error) {
      console.error("Error renovando la URL de la imagen:", error);
    }
  };

  /* ────────────────────────────────
      5. Redirecciones basicas
  ──────────────────────────────────*/
  useEffect(() => {
    if (!ready) return;
    if (!user) {
      router.replace("/login");
    } else if (!userRole) {
      router.replace("/select-role");
    }
  }, [ready, user, userRole, router]);

  /* ────────────────────────────────
      6. Cargar postulaciones del empleado
  ──────────────────────────────────*/
  useEffect(() => {
    if (!ready || userRole !== "empleado" || !token) {
      setApplications([]);
      return;
    }
    const fetchApplications = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/job/my-applications`, {
          headers: { "Content-Type": "application/json", ...authHeader() },
        });
        if (res.ok) {
          const { applications: apps } = await res.json();
          setApplications(apps);
        } else if (res.status === 401) {
          localStorage.removeItem("userToken");
          setApplications([]);
        }
      } catch (error) {
        console.error("Error fetching applications:", error);
      }
    };
    fetchApplications();
  }, [ready, userRole, token, authHeader]);

  /* ────────────────────────────────
      7. Confirmar cancelación de postulación
  ──────────────────────────────────*/
  const confirmCancelApplication = async () => {
    const jobId = selectedCancelJobId;
    try {
      const res = await fetch(`${API_BASE}/api/job/cancel-application`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json", ...authHeader() },
        body: JSON.stringify({ jobId }),
      });
      if (res.ok) {
        setApplications((prev) => prev.filter((a) => a.jobId !== jobId));
        setSnackbar({ open: true, message: "Postulación cancelada", severity: "success" });
      } else if (res.status === 401) {
        localStorage.removeItem("userToken");
        setApplications([]);
        setSnackbar({ open: true, message: "Token expirado, inicia sesión nuevamente", severity: "error" });
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

  /* ────────────────────────────────
      8. Cerrar sesión
  ──────────────────────────────────*/
  const handleSignOut = async () => {
    await signOut({ redirect: false });
    setSnackbar({ open: true, message: "Sesión cerrada correctamente", severity: "success" });
    setTimeout(() => router.push("/login"), 1200);
  };

  /* ────────────────────────────────
      9. Esperar auth listo
  ──────────────────────────────────*/
  if (!ready || sessionStatus === "loading" || !userRole) {
    return <p>Cargando…</p>;
  }

  /* ────────────────────────────────
      10. Render
  ──────────────────────────────────*/
  return (
    <DashboardLayout userRole={userRole} toggleDarkMode={toggleDarkMode} currentMode={currentMode}>
      <Box sx={{ textAlign: "center", mt: 4 }}>
        <Avatar
          src={profileImageUrl}
          onError={handleImageError}
          sx={{ width: 100, height: 100, border: "2px solid #ccc", mx: "auto", mb: 2 }}
        />
        <Typography variant="h6">Bienvenido, {user?.name || "Usuario"}</Typography>
        <Typography variant="body1" color="text.secondary">
          Tu rol: {userRole}
        </Typography>

        {/* Opciones para empleado */}
        {userRole === "empleado" && (
          <>
            <Box sx={{ mt: 3, mx: "auto", maxWidth: 500 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Button fullWidth variant="contained" component={Link} href="/job-list">
                    Ver Ofertas de Empleo
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Button fullWidth variant="outlined" component={Link} href="/profile-empleado">
                    Actualizar Perfil
                  </Button>
                </Grid>
              </Grid>
            </Box>
            <Paper sx={{ maxWidth: 900, mx: "auto", mt: 4, p: 3, borderRadius: 2 }}>
              <Typography variant="h5" gutterBottom>
                Mis Postulaciones
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {applications.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No has postulado a ningún empleo.
                </Typography>
              ) : (
                <Grid container spacing={3} justifyContent="center">
                  {applications.map((app) => (
                    <Grid item xs={12} sm={6} md={4} key={app.id}>
                      <Card sx={{ display: "flex", flexDirection: "column", height: "100%", bgcolor: "rgba(217,98,54,0.15)" }}>
                        <CardContent sx={{ flexGrow: 1 }}>
                          <Typography variant="h6">{app.job?.title}</Typography>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 1 }}
                          >
                            <span>
                              Publicado el:{" "}
                              {app.job?.createdAt
                                ? new Date(app.job.createdAt).toLocaleDateString()
                                : "Sin fecha"}
                            </span>
                          </Typography>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 1 }}
                          >
                            Candidatos postulados: {app.job?._count?.applications ?? 0}
                            <PersonIcon fontSize="small" />
                          </Typography>
                        </CardContent>
                        <CardActions sx={{ justifyContent: "space-between" }}>
                          <Button component={Link} href={`/job-offer?id=${app.job?.id}`} size="small" variant="outlined">
                            Ver Detalles
                          </Button>
                          <Button
                            onClick={() => {
                              setSelectedCancelJobId(app.job?.id);
                              setOpenCancelDialog(true);
                            }}
                            size="small"
                            variant="contained"
                            color="secondary"
                          >
                            Cancelar Postulación
                          </Button>
                        </CardActions>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Paper>
          </>
        )}

        {/* Opciones para empleador */}
        {userRole !== "empleado" && (
          <Paper sx={{ maxWidth: 500, mx: "auto", mt: 4, p: 3, borderRadius: 2 }}>
            <Typography variant="h5" gutterBottom>
              Opciones de Empleador
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Button fullWidth variant="contained" component={Link} href="/job-create">
                  Publicar Oferta de Empleo
                </Button>
              </Grid>
              <Grid item xs={12}>
                <Button fullWidth variant="outlined" component={Link} href="/job-list">
                  Mis Ofertas Publicadas
                </Button>
              </Grid>
              <Grid item xs={12}>
                <Button fullWidth variant="outlined" component={Link} href="/profile-empleador">
                  Actualizar Perfil
                </Button>
              </Grid>
            </Grid>
          </Paper>
        )}

        <Box sx={{ textAlign: "center", mt: 4 }}>
          <Button onClick={handleSignOut} variant="contained" color="error">
            Cerrar sesión
          </Button>
        </Box>
      </Box>

      {/* Diálogo Confirmar Cancelación */}
      <Dialog open={openCancelDialog} onClose={cancelCancelApplication}>
        <DialogTitle>Confirmar Cancelación</DialogTitle>
        <DialogContent>
          <Typography>¿Deseas cancelar tu postulación a este empleo?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelCancelApplication} color="primary">
            Volver
          </Button>
          <Button onClick={confirmCancelApplication} color="secondary" variant="contained">
            Confirmar
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
          sx={{
            width: "100%",
            bgcolor: (theme) =>
              snackbar.severity === "success"
                ? theme.palette.secondary.main
                : snackbar.severity === "error"
                ? theme.palette.error.main
                : theme.palette.info.main,
            color: "#fff",
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </DashboardLayout>
  );
}
