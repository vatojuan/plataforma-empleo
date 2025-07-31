import { useState, useEffect, useCallback } from "react";
import { Container, Typography, Grid, Snackbar, Alert, CircularProgress, Box } from "@mui/material";
import DashboardLayout from "../components/DashboardLayout"; // Usando tu layout existente
import CourseCard from "../components/CourseCard";
import { getCourses, enrollCourse } from "../services/api"; // Tus servicios de API

export default function Training({ toggleDarkMode, currentMode }) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const fetchCourses = useCallback(async () => {
    // Asumo que tienes un token de usuario normal, no de admin
    const token = localStorage.getItem('authToken');
    if (!token) {
        setLoading(false);
        // Aquí podrías redirigir al login si es necesario
        return;
    }
    try {
      setLoading(true);
      // Este endpoint ya devuelve si el usuario está inscrito y su progreso
      const coursesData = await getCourses(token); 
      setCourses(coursesData);
    } catch (error) {
      setSnackbar({ open: true, message: error.message || "Error al cargar los cursos", severity: "error" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const handleEnroll = useCallback(async (courseId) => {
    const token = localStorage.getItem('authToken');
    try {
      await enrollCourse(courseId, token);
      setSnackbar({ open: true, message: "Inscripción exitosa", severity: "success" });
      // Refrescar la lista para mostrar el botón "Ver Curso"
      fetchCourses();
    } catch (error) {
      setSnackbar({ open: true, message: error.message || "Error en la inscripción", severity: "error" });
    }
  }, [fetchCourses]);
  
  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  if (loading) {
    return (
      <DashboardLayout toggleDarkMode={toggleDarkMode} currentMode={currentMode}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
          <CircularProgress />
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout toggleDarkMode={toggleDarkMode} currentMode={currentMode}>
      <Container sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" align="center" gutterBottom>
          Formación y Capacitación
        </Typography>
        <Typography variant="body1" align="center" sx={{ mb: 4 }}>
          Aquí encontrarás cursos para mejorar tus habilidades.
        </Typography>
        <Grid container spacing={4}>
          {courses.map((course) => (
            <Grid item xs={12} sm={6} md={4} key={course.id}>
              <CourseCard
                course={course}
                isEnrolled={course.isEnrolled}
                onEnroll={handleEnroll}
              />
            </Grid>
          ))}
        </Grid>
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} variant="filled" sx={{ width: "100%" }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </DashboardLayout>
  );
}
