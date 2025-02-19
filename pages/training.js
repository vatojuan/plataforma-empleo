import { useState, useEffect } from "react";
import { Box, Container, Typography, Button, Grid, Card, CardContent, CardActions, LinearProgress, Snackbar, Alert } from "@mui/material";
import DashboardLayout from "../components/DashboardLayout";
import Link from "next/link";

// Datos de ejemplo para cursos
const dummyCourses = [
  { id: 1, title: "Curso de React", description: "Aprende React desde cero", progress: 0 },
  { id: 2, title: "Introducción a Node.js", description: "Conoce el backend con Node.js", progress: 0 },
  { id: 3, title: "Desarrollo de UI con Material-UI", description: "Crea interfaces modernas", progress: 0 },
];

export default function Training({ toggleDarkMode, currentMode }) {
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]); // IDs de cursos en los que se inscribió el usuario
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  // Cargar cursos (en un escenario real, se obtiene de una API)
  useEffect(() => {
    setCourses(dummyCourses);
  }, []);

  // Función para inscribirse en un curso
  const handleEnroll = (courseId) => {
    if (!enrollments.includes(courseId)) {
      setEnrollments([...enrollments, courseId]);
      setSnackbar({ open: true, message: "Inscripción exitosa", severity: "success" });
    }
  };

  // Función para abandonar un curso
  const handleUnenroll = (courseId) => {
    if (enrollments.includes(courseId)) {
      setEnrollments(enrollments.filter((id) => id !== courseId));
      setSnackbar({ open: true, message: "Has abandonado el curso", severity: "info" });
    }
  };

  return (
    <DashboardLayout toggleDarkMode={toggleDarkMode} currentMode={currentMode}>
      <Container sx={{ mt: 4 }}>
        <Typography variant="h4" align="center" gutterBottom>
          Formación y Capacitación
        </Typography>
        <Typography variant="body1" align="center" sx={{ mb: 3 }}>
          Aquí encontrarás cursos para mejorar tus habilidades.
        </Typography>
        <Grid container spacing={3}>
          {courses.map((course) => (
            <Grid item xs={12} sm={6} md={4} key={course.id}>
              <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" gutterBottom>
                    {course.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {course.description}
                  </Typography>
                  {enrollments.includes(course.id) && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2">Progreso:</Typography>
                      <LinearProgress variant="determinate" value={course.progress} />
                    </Box>
                  )}
                </CardContent>
                <CardActions sx={{ justifyContent: "flex-end" }}>
                  {enrollments.includes(course.id) ? (
                    <Button size="small" variant="contained" color="secondary" onClick={() => handleUnenroll(course.id)}>
                      Abandonar
                    </Button>
                  ) : (
                    <Button size="small" variant="contained" color="primary" onClick={() => handleEnroll(course.id)}>
                      Inscribirme
                    </Button>
                  )}
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} variant="filled" sx={{ width: "100%" }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </DashboardLayout>
  );
}
