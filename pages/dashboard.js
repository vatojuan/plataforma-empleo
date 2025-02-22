import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Link from "next/link";
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
  Alert
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";

export default function Dashboard({ toggleDarkMode, currentMode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [applications, setApplications] = useState([]);

  // Inicializa la URL de la imagen una sola vez
  const initialImageUrl = session?.user?.image || "/images/default-user.png";
  const [profileImageUrl, setProfileImageUrl] = useState(initialImageUrl);

  // Eliminamos este useEffect para no reinicializar profileImageUrl al cambiar la sesión
  // useEffect(() => {
  //   if (session?.user?.image) {
  //     setProfileImageUrl(session.user.image);
  //   }
  // }, [session]);

  // Handler para renovar la URL si la imagen falla al cargar
  const handleImageError = async () => {
    try {
      let endpoint = "";
      if (session.user.role === "empleado") {
        endpoint = "/api/employee/renew-profile-picture";
      } else {
        endpoint = "/api/employer/renew-profile-picture";
      }
      const res = await fetch(endpoint);
      const data = await res.json();
      if (data.url) {
        setProfileImageUrl(data.url);
      }
    } catch (error) {
      console.error("Error renovando la URL de la imagen:", error);
    }
  };

  // Estado para el diálogo de confirmación de cancelación de postulación
  const [openCancelDialog, setOpenCancelDialog] = useState(false);
  const [selectedCancelJobId, setSelectedCancelJobId] = useState(null);

  // Snackbar para notificaciones
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  useEffect(() => {
    if (status !== "loading" && !session) {
      router.push("/login");
    } else if (session && !session.user.role) {
      router.push("/select-role");
    }
  }, [status, session, router]);

  useEffect(() => {
    async function fetchApplications() {
      if (session && session.user.role === "empleado") {
        try {
          const res = await fetch("/api/job/my-applications");
          if (res.ok) {
            const data = await res.json();
            console.log("Aplicaciones recibidas:", data);
            setApplications(data.applications);
          }
        } catch (error) {
          console.error("Error fetching applications:", error);
        }
      }
    }
    if (status !== "loading") {
      fetchApplications();
    }
  }, [session, status]);

  if (status === "loading" || !session || !session.user.role) {
    return <p>Cargando...</p>;
  }

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
        setApplications((prevApps) =>
          prevApps.filter((app) => app.job.id !== selectedCancelJobId)
        );
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

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    setSnackbar({ open: true, message: "Sesión cerrada correctamente", severity: "success" });
    setTimeout(() => router.push("/login"), 1500);
  };

  // Función para determinar si el empleado ya ha postulado a una oferta
  const isApplied = (jobId) => {
    return applications.some((app) => app.job.id === jobId);
  };

  return (
    <DashboardLayout userRole={session.user.role} toggleDarkMode={toggleDarkMode} currentMode={currentMode}>
      <Box sx={{ textAlign: "center", mt: 4 }}>
        <Avatar
          src={profileImageUrl}
          onError={handleImageError}
          sx={{ width: 100, height: 100, border: "2px solid #ccc", mx: "auto", mb: 2 }}
        />
        <Typography variant="h6">Bienvenido, {session.user.name}</Typography>
        <Typography variant="body1" color="text.secondary">
          Tu rol: {session.user.role}
        </Typography>

        {session.user.role === "empleado" && (
          <>
            <Box sx={{ mt: 3, mx: "auto", maxWidth: 500 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Button fullWidth variant="contained" component={Link} href="/job-list" color="primary">
                    Ver Ofertas de Empleo
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Button fullWidth variant="outlined" component={Link} href="/profile-empleado" color="primary">
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
                <Grid
                  container
                  spacing={3}
                  sx={{
                    maxWidth: { xs: "100%", sm: 900 },
                    mx: "auto",
                    justifyContent: "center"
                  }}
                >
                  {applications.map((app) => (
                    <Grid item xs={12} sm={6} md={4} key={app.id}>
                      <Card sx={{ display: "flex", flexDirection: "column", height: "100%", bgcolor: "rgba(201,124,95, 0.15)" }}>
                        <CardContent sx={{ flexGrow: 1 }}>
                          <Typography variant="h6" gutterBottom>
                            {app.job.title}
                          </Typography>
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
                            <span>
                              Publicado el:{" "}
                              {app.job.createdAt ? new Date(app.job.createdAt).toLocaleDateString() : "Sin fecha"}
                            </span>
                            <span style={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                              {/* Puedes agregar íconos adicionales aquí */}
                            </span>
                          </Typography>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 1 }}
                          >
                            Candidatos postulados: {app.job._count?.applications ?? 0}
                            <PersonIcon fontSize="small" />
                          </Typography>
                        </CardContent>
                        <CardActions sx={{ justifyContent: "space-between" }}>
                          <Button
                            component={Link}
                            href={`/job-offer?id=${app.job.id}`}
                            size="small"
                            variant="outlined"
                            color="primary"
                          >
                            Ver Detalles
                          </Button>
                          <Button
                            onClick={() => handleRequestCancelApplication(app.job.id)}
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

        {session.user.role !== "empleado" && (
          <Paper sx={{ maxWidth: 500, mx: "auto", mt: 4, p: 3, borderRadius: 2 }}>
            <Typography variant="h5" gutterBottom>
              Opciones de Empleador
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Button fullWidth variant="contained" component={Link} href="/job-create" color="primary">
                  Publicar Oferta de Empleo
                </Button>
              </Grid>
              <Grid item xs={12}>
                <Button fullWidth variant="outlined" component={Link} href="/job-list" color="primary">
                  Mis Ofertas Publicadas
                </Button>
              </Grid>
              <Grid item xs={12}>
                <Button fullWidth variant="outlined" component={Link} href="/profile-empleador" color="primary">
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

      <Dialog open={openCancelDialog} onClose={cancelCancelApplication}>
        <DialogTitle>Confirmar Cancelación</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Deseas cancelar tu postulación a este empleo?
          </Typography>
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
