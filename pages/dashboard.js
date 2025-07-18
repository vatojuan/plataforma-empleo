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

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "https://api.fapmendoza.online";

export default function Dashboard({ toggleDarkMode, currentMode }) {
  // 1) Autenticación centralizada
  const { user, role: userRole, token, authHeader, ready, sessionStatus } =
    useAuthUser();
  const { data: session } = useSession();
  const router = useRouter();

  // 2) Estado local
  const [applications, setApplications] = useState([]);
  const [profileImageUrl, setProfileImageUrl] = useState(
    "/images/default-user.png"
  );
  const [openCancelDialog, setOpenCancelDialog] = useState(false);
  const [selectedCancelJobId, setSelectedCancelJobId] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // 3) Forzar revalidación de sesión al montar
  useEffect(() => {
    getSession();
  }, []);

  // 4) Actualizar la imagen de perfil cuando cambie session.user.image
  useEffect(() => {
    if (session?.user?.image) {
      setProfileImageUrl(session.user.image);
    }
  }, [session]);

  // 5) Redirigir si no está listo o no hay usuario / rol
  useEffect(() => {
    if (!ready) return;
    if (!user) {
      router.replace("/login");
    } else if (!userRole) {
      router.replace("/select-role");
    }
  }, [ready, user, userRole, router]);

  // 6) Cargar postulaciones (solo empleado)
  useEffect(() => {
    if (!ready || userRole !== "empleado" || !token) {
      setApplications([]);
      return;
    }
    const fetchApplications = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/job/my-applications`, {
          headers: {
            "Content-Type": "application/json",
            ...authHeader(),
          },
        });
        if (res.ok) {
          const { applications: apps } = await res.json();
          setApplications(apps);
        } else if (res.status === 401) {
          localStorage.removeItem("userToken");
          setApplications([]);
        } else {
          console.error("my-applications status:", res.status);
        }
      } catch (error) {
        console.error("Error fetching applications:", error);
      }
    };
    fetchApplications();
  }, [ready, userRole, token, authHeader]);

  // 7) Confirmar cancelación de postulación
  const confirmCancelApplication = async () => {
    const jobId = selectedCancelJobId;
    try {
      const res = await fetch(`${API_BASE}/api/job/cancel-application`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...authHeader(),
        },
        body: JSON.stringify({ jobId }),
      });
      if (res.ok) {
        setApplications((prev) => prev.filter((a) => a.jobId !== jobId));
        setSnackbar({
          open: true,
          message: "Postulación cancelada",
          severity: "success",
        });
      } else if (res.status === 401) {
        localStorage.removeItem("userToken");
        setApplications([]);
        setSnackbar({
          open: true,
          message: "Token expirado. Vuelve a iniciar sesión.",
          severity: "error",
        });
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

  const cancelCancelApplication = () => {
    setOpenCancelDialog(false);
    setSelectedCancelJobId(null);
  };

  // 8) Cerrar sesión
  const handleSignOut = async () => {
    await signOut({ redirect: false });
    setSnackbar({
      open: true,
      message: "Sesión cerrada correctamente",
      severity: "success",
    });
    setTimeout(() => router.push("/login"), 1200);
  };

  // 9) Spinner mientras no esté listo
  if (!ready || sessionStatus === "loading" || !userRole) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  // 10) Render final
  return (
    <DashboardLayout
      userRole={userRole}
      toggleDarkMode={toggleDarkMode}
      currentMode={currentMode}
    >
      <Box sx={{ textAlign: "center", mt: 4 }}>
        <Avatar
          src={profileImageUrl}
          onError={async () => {
            try {
              const endpoint =
                userRole === "empleado"
                  ? "/api/employee/renew-profile-picture"
                  : "/api/employer/renew-profile-picture";
              const r = await fetch(endpoint);
              const d = await r.json();
              if (d.url) setProfileImageUrl(d.url);
            } catch (e) {
              console.error("Error renovando URL de la imagen:", e);
            }
          }}
          sx={{
            width: 100,
            height: 100,
            border: "2px solid #ccc",
            mx: "auto",
            mb: 2,
          }}
        />
        <Typography variant="h6">
          Bienvenido, {session?.user?.name || "Usuario"}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Tu rol: {userRole}
        </Typography>

        {userRole === "empleado" && (
          <>
            <Box sx={{ mt: 3, mx: "auto", maxWidth: 500 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Button
                    fullWidth
                    variant="contained"
                    component={Link}
                    href="/job-list"
                  >
                    Ver Ofertas de Empleo
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Button
                    fullWidth
                    variant="outlined"
                    component={Link}
                    href="/profile-empleado"
                  >
                    Actualizar Perfil
                  </Button>
                </Grid>
              </Grid>
            </Box>

            <Paper
              sx={{
                maxWidth: 900,
                mx: "auto",
                mt: 4,
                p: 3,
                borderRadius: 2,
              }}
            >
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
                      <Card
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          height: "100%",
                          bgcolor: "rgba(217,98,54,0.15)",
                        }}
                      >
                        <CardContent sx={{ flexGrow: 1 }}>
                          {/* Título */}
                          <Typography variant="h6">
                            {app.jobTitle}
                          </Typography>
                          {/* Fecha de publicación */}
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              mt: 1,
                            }}
                          >
                            Publicado el:{" "}
                            {app.jobPostedAt
                              ? new Date(app.jobPostedAt).toLocaleDateString()
                              : "Sin fecha"}
                          </Typography>
                          {/* Contador de candidatos */}
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
                            Candidatos postulados:{" "}
                            {app.candidatesCount ?? 0}
                            <PersonIcon fontSize="small" />
                          </Typography>
                        </CardContent>

                        <CardActions
                          sx={{ justifyContent: "space-between" }}
                        >
                          {/* Ver detalles */}
                          <Button
                            component={Link}
                            href={`/job-offer?id=${app.jobId}`}
                            size="small"
                            variant="outlined"
                          >
                            Ver Detalles
                          </Button>

                          {/* Botón según estado */}
                          {["pending", "waiting"].includes(app.status) ? (
                            <Button
                              size="small"
                              variant="contained"
                              color="secondary"
                              onClick={() => {
                                setSelectedCancelJobId(app.jobId);
                                setOpenCancelDialog(true);
                              }}
                            >
                              Cancelar Postulación
                            </Button>
                          ) : (
                            <Button
                              size="small"
                              variant="outlined"
                              disabled
                            >
                              Propuesta enviada
                            </Button>
                          )}
                        </CardActions>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Paper>
          </>
        )}

        {userRole !== "empleado" && (
          <Paper
            sx={{
              maxWidth: 500,
              mx: "auto",
              mt: 4,
              p: 3,
              borderRadius: 2,
            }}
          >
            <Typography variant="h5" gutterBottom>
              Opciones de Empleador
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Button
                  fullWidth
                  variant="contained"
                  component={Link}
                  href="/job-create"
                >
                  Publicar Oferta de Empleo
                </Button>
              </Grid>
              <Grid item xs={12}>
                <Button
                  fullWidth
                  variant="outlined"
                  component={Link}
                  href="/job-list"
                >
                  Mis Ofertas Publicadas
                </Button>
              </Grid>
              <Grid item xs={12}>
                <Button
                  fullWidth
                  variant="outlined"
                  component={Link}
                  href="/profile-empleador"
                >
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
          <Typography>
            ¿Deseas cancelar tu postulación a este empleo?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelCancelApplication} color="primary">
            Volver
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
