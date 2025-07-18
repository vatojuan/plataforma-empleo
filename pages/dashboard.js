// pages/dashboard.js
import { useRouter } from "next/router";
import { signOut, getSession, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
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
  CircularProgress,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "https://api.fapmendoza.online";

export default function Dashboard({ toggleDarkMode, currentMode }) {
  /* ─── 1. Auth centralizada ─── */
  const { user, role: userRole, token, authHeader, ready, sessionStatus } =
    useAuthUser();
  const { data: session } = useSession();
  const router = useRouter();

  /* ─── 2. State ─── */
  const [applications, setApplications] = useState([]); // <-- trae label + status
  const [profileImageUrl, setProfileImageUrl] = useState("/images/default-user.png");
  const [openCancelDialog, setOpenCancelDialog] = useState(false);
  const [selectedCancelJobId, setSelectedCancelJobId] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  /* ─── 3. Forzar revalidación al montar ─── */
  useEffect(() => {
    getSession();
  }, []);

  /* ─── 4. Sync avatar (NextAuth) ─── */
  useEffect(() => {
    if (session?.user?.image) setProfileImageUrl(session.user.image);
  }, [session]);

  /* ─── 5. Redirecciones de guardia ─── */
  useEffect(() => {
    if (!ready) return;
    if (!user) router.replace("/login");
    else if (!userRole) router.replace("/select-role");
  }, [ready, user, userRole, router]);

  /* ─── 6. Fetch postulaciones (empleado) ─── */
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

        if (res.status === 401) {
          localStorage.removeItem("userToken");
          setApplications([]);
        } else if (res.ok) {
          const { applications: apps } = await res.json();
          setApplications(apps);
        }
      } catch (err) {
        console.error("[Dashboard] fetchApps:", err);
      }
    };

    fetchApplications();
  }, [ready, userRole, token, authHeader]);

  /* ─── 7. Cancelar postulación ─── */
  const confirmCancelApplication = async () => {
    const jobId = selectedCancelJobId;
    try {
      const res = await fetch(`${API_BASE}/api/job/cancel-application`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json", ...authHeader() },
        body: JSON.stringify({ jobId }),
      });

      if (res.ok) {
        setApplications((prev) => prev.filter((a) => a.job.id !== jobId));
        setSnackbar({ open: true, message: "Postulación cancelada", severity: "success" });
      } else if (res.status === 401) {
        localStorage.removeItem("userToken");
        setApplications([]);
        setSnackbar({
          open: true,
          message: "Token expirado. Vuelve a iniciar sesión.",
          severity: "error",
        });
      } else {
        setSnackbar({ open: true, message: "Error al cancelar", severity: "error" });
      }
    } catch (err) {
      console.error("[Dashboard] cancel:", err);
      setSnackbar({ open: true, message: "Error al cancelar", severity: "error" });
    } finally {
      setOpenCancelDialog(false);
      setSelectedCancelJobId(null);
    }
  };

  /* ─── 8. Sign-out ─── */
  const handleSignOut = async () => {
    await signOut({ redirect: false });
    setSnackbar({ open: true, message: "Sesión cerrada", severity: "success" });
    setTimeout(() => router.push("/login"), 1200);
  };

  /* ─── 9. Loader global ─── */
  if (!ready || sessionStatus === "loading" || !userRole) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  /* ─── 10. Render ─── */
  return (
    <DashboardLayout
      toggleDarkMode={toggleDarkMode}
      currentMode={currentMode}
      userRole={userRole}
    >
      <Box sx={{ textAlign: "center", mt: 4 }}>
        <Avatar
          src={profileImageUrl}
          sx={{ width: 100, height: 100, border: "2px solid #ccc", mx: "auto", mb: 2 }}
        />
        <Typography variant="h6">
          Bienvenido, {session?.user?.name || "Usuario"}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Tu rol: {userRole}
        </Typography>

        {/* ─── Bloque EMPLEADO ─── */}
        {userRole === "empleado" && (
          <>
            {/* Acciones principales */}
            <Box sx={{ mt: 3, mx: "auto", maxWidth: 500 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Button fullWidth variant="contained" component={Link} href="/job-list">
                    Ver Ofertas
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Button fullWidth variant="outlined" component={Link} href="/profile-empleado">
                    Actualizar Perfil
                  </Button>
                </Grid>
              </Grid>
            </Box>

            {/* Postulaciones */}
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
                  {applications.map((app) => {
                    const { job } = app;
                    const isCancelable =
                      (app.label === "automatic" && app.status === "waiting") ||
                      (app.label === "manual" && app.status === "pending");

                    return (
                      <Grid item xs={12} sm={6} md={4} key={app.id}>
                        <Card
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            height: "100%",
                            bgcolor: "rgba(217,98,54,0.15)",
                          }}
                        >
                          <CardContent sx={{ flexGrow: 1 }}>
                            <Typography variant="h6">{job.title}</Typography>

                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{ mt: 1 }}
                            >
                              Publicado el:{" "}
                              {job.createdAt
                                ? new Date(job.createdAt).toLocaleDateString()
                                : "Sin fecha"}
                            </Typography>

                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 1 }}
                            >
                              Candidatos postulados: {job.candidatesCount ?? 0}
                              <PersonIcon fontSize="small" />
                            </Typography>
                          </CardContent>

                          <CardActions sx={{ justifyContent: "space-between" }}>
                            <Button
                              component={Link}
                              href={`/job-offer?id=${job.id}`}
                              size="small"
                              variant="outlined"
                            >
                              Ver Detalles
                            </Button>

                            {isCancelable ? (
                              <Button
                                size="small"
                                variant="contained"
                                color="secondary"
                                onClick={() => {
                                  setSelectedCancelJobId(job.id);
                                  setOpenCancelDialog(true);
                                }}
                              >
                                Cancelar Postulación
                              </Button>
                            ) : (
                              <Button size="small" variant="outlined" disabled>
                                Propuesta enviada
                              </Button>
                            )}
                          </CardActions>
                        </Card>
                      </Grid>
                    );
                  })}
                </Grid>
              )}
            </Paper>
          </>
        )}

        {/* ─── Bloque EMPLEADOR o ADMIN ─── */}
        {userRole !== "empleado" && (
          <Paper sx={{ maxWidth: 500, mx: "auto", mt: 4, p: 3, borderRadius: 2 }}>
            <Typography variant="h5" gutterBottom>
              Opciones de Empleador
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Button fullWidth variant="contained" component={Link} href="/job-create">
                  Publicar Oferta
                </Button>
              </Grid>
              <Grid item xs={12}>
                <Button fullWidth variant="outlined" component={Link} href="/job-list">
                  Mis Ofertas
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

        {/* Sign out */}
        <Box sx={{ textAlign: "center", mt: 4 }}>
          <Button onClick={handleSignOut} variant="contained" color="error">
            Cerrar sesión
          </Button>
        </Box>
      </Box>

      {/* ─── Dialog cancelar ─── */}
      <Dialog open={openCancelDialog} onClose={() => setOpenCancelDialog(false)}>
        <DialogTitle>Confirmar Cancelación</DialogTitle>
        <DialogContent>
          <Typography>¿Deseas cancelar tu postulación a este empleo?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCancelDialog(false)}>Volver</Button>
          <Button onClick={confirmCancelApplication} color="secondary" variant="contained">
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>

      {/* ─── Snackbar ─── */}
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
