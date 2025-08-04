// pages/cursos/[cursoId].js
import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";                               // ← nuevo
import { useRouter } from "next/router";
import {
  Box,
  Container,
  Typography,
  CircularProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Divider,
  Button,
  Grid,
  Snackbar,
  Alert,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import DashboardLayout from "../../components/DashboardLayout";
import useAuthUser from "../../hooks/useAuthUser";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "https://api.fapmendoza.online";

export default function CursoDetallePage({ toggleDarkMode, currentMode }) {
  // ────────────────────────────── Hooks y estado ───────────────────────────
  const { user, ready: authReady, token } = useAuthUser();
  const router = useRouter();
  const { cursoId } = router.query;

  const [course, setCourse] = useState(null);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Video: referencia y control anti-adelanto
  const videoRef = useRef(null);
  const [maxWatched, setMaxWatched] = useState(0);

  // ────────────────────────── Helpers de UI ────────────────────────────────
  const showMessage = (msg, severity = "success") =>
    setSnackbar({ open: true, message: msg, severity });

  // ────────────────────────── Fetch de detalles ────────────────────────────
  const fetchDetails = useCallback(async () => {
    if (!cursoId || !token) return;
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/training/courses/${cursoId}/details`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok)
        throw new Error((await res.json()).detail || "Error al cargar detalles");

      const data = await res.json();
      setCourse(data);

      const firstUncompleted = data.lessons.find((l) => !l.isCompleted);
      setSelectedLesson(firstUncompleted || data.lessons[0] || null);
      setMaxWatched(0);
    } catch (err) {
      showMessage(err.message, "error");
    } finally {
      setLoading(false);
    }
  }, [cursoId, token]);

  // ───────────────────────────── useEffect inicial ─────────────────────────
  useEffect(() => {
    if (authReady) {
      if (user) fetchDetails();
      else router.push("/login");
    }
  }, [authReady, user, router, fetchDetails]);

  // ─────────────────── Completar lección automáticamente ───────────────────
  const markLessonCompleted = useCallback(
    async (lessonId) => {
      if (!lessonId || !token) return;
      try {
        const res = await fetch(
          `${API_BASE}/training/lessons/${lessonId}/complete`,
          {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!res.ok)
          throw new Error((await res.json()).detail || "Error al marcar lección");

        await fetchDetails();
        showMessage("¡Lección completada!");
      } catch (err) {
        showMessage(err.message, "error");
      }
    },
    [token, fetchDetails]
  );

  // ─────────────────────────── Abandonar curso ────────────────────────────
  const handleUnenroll = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/training/unenroll/${cursoId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok)
        throw new Error((await res.json()).detail || "Error al abandonar curso");

      showMessage("Curso abandonado", "info");
      router.push("/training");
    } catch (err) {
      showMessage(err.message, "error");
    }
  }, [token, cursoId, router]);

  // ──────────────────── Control de progreso de video ──────────────────────
  const handleTimeUpdate = () => {
    const v = videoRef.current;
    if (v && v.currentTime > maxWatched) setMaxWatched(v.currentTime);
  };

  const handleSeeking = () => {
    const v = videoRef.current;
    if (v && v.currentTime > maxWatched + 0.1) v.currentTime = maxWatched;
  };

  // ────────────────────────── Render condicional ───────────────────────────
  if (!authReady || loading) {
    return (
      <DashboardLayout>
        <Container sx={{ textAlign: "center", mt: 5 }}>
          <CircularProgress />
        </Container>
      </DashboardLayout>
    );
  }

  if (!course) {
    return (
      <DashboardLayout>
        <Container>
          <Typography sx={{ mt: 4 }}>Curso no encontrado.</Typography>
        </Container>
      </DashboardLayout>
    );
  }

  // ────────────────────────────── JSX final ────────────────────────────────
  return (
    <DashboardLayout toggleDarkMode={toggleDarkMode} currentMode={currentMode}>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {/* Encabezado con botón Abandonar */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography variant="h4">{course.title}</Typography>
          <Button variant="outlined" color="error" onClick={handleUnenroll}>
            Abandonar curso
          </Button>
        </Box>

        <Grid container spacing={4}>
          {/* Panel de video */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 2 }}>
              {selectedLesson ? (
                <>
                  <Typography variant="h6" gutterBottom>
                    {selectedLesson.title}
                  </Typography>

                  <Box
                    sx={{
                      position: "relative",
                      paddingTop: "56.25%",
                      bgcolor: "#000",
                    }}
                  >
                    <video
                      key={selectedLesson.id}
                      ref={videoRef}
                      src={selectedLesson.videoUrl}
                      controls
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                      }}
                      onTimeUpdate={handleTimeUpdate}
                      onSeeking={handleSeeking}
                      onEnded={() => markLessonCompleted(selectedLesson.id)}
                      onError={(e) =>
                        console.error("Error al cargar el video:", e)
                      }
                    />
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Typography variant="body2" color="text.secondary">
                    {selectedLesson.isCompleted
                      ? "Lección completada automáticamente."
                      : "Visualiza el video completo para completar la lección."}
                  </Typography>
                </>
              ) : (
                <Typography>
                  Selecciona una lección para comenzar o el curso no tiene
                  lecciones.
                </Typography>
              )}
            </Paper>
          </Grid>

          {/* Lista de lecciones */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2, maxHeight: "80vh", overflowY: "auto" }}>
              <Typography variant="h6" gutterBottom>
                Lecciones
              </Typography>
              <List>
                {course.lessons.map((lesson) => (
                  <ListItem
                    key={lesson.id}
                    button
                    onClick={() => {
                      setSelectedLesson(lesson);
                      setMaxWatched(0);
                    }}
                    selected={selectedLesson?.id === lesson.id}
                    sx={{ mb: 1, border: "1px solid #ddd", borderRadius: 1 }}
                  >
                    <ListItemIcon>
                      {lesson.isCompleted ? (
                        <CheckCircleIcon color="success" />
                      ) : (
                        <PlayCircleOutlineIcon />
                      )}
                    </ListItemIcon>
                    <ListItemText
                      primary={lesson.title}
                      secondary={`Lección ${lesson.orderIndex + 1}`}
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>
        </Grid>

        {/* Botón Volver al Dashboard */}
        <Divider sx={{ my: 3 }} />
        <Box sx={{ textAlign: "center", mt: 2 }}>
          <Link href="/dashboard" style={{ textDecoration: "none" }}>
            <Button variant="contained" color="primary">
              Volver al Dashboard
            </Button>
          </Link>
        </Box>

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        >
          <Alert
            onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
            severity={snackbar.severity}
            sx={{ width: "100%" }}
            variant="filled"
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </DashboardLayout>
  );
}
