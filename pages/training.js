import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import {
  Container, Typography, Grid, Snackbar, Alert, CircularProgress, Box, Card,
  CardContent, CardActions, Button, CardMedia
} from '@mui/material';
import DashboardLayout from 'components/DashboardLayout'; // Usando tu layout principal
import useAuthUser from 'hooks/useAuthUser'; // Usando tu hook de autenticación

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://api.fapmendoza.online";

// --- Componente de Tarjeta de Curso reutilizable ---
const CourseCard = ({ course }) => {
    const router = useRouter();

    const handleSeeCourse = (courseId) => {
        router.push(`/cursos/${courseId}`);
    };

    const handleEnroll = async (courseId) => {
        const token = localStorage.getItem('userToken');
        if (!token) {
            // Podrías mostrar un snackbar aquí si lo deseas
            console.error("No hay token de autenticación");
            return;
        }
        try {
            const res = await fetch(`${API_BASE}/training/enroll/${courseId}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error((await res.json()).detail || 'Error en la inscripción.');
            // Forzar un refresh de la página para actualizar el estado de los cursos
            router.reload();
        } catch (error) {
            console.error("Error al inscribirse:", error);
        }
    };

    return (
        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardMedia
                component="img"
                height="140"
                image={course.imageUrl || 'https://placehold.co/600x400/4E342E/FFF?text=Curso'}
                alt={`Portada de ${course.title}`}
            />
            <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h5" component="div">{course.title}</Typography>
                <Typography variant="body2" color="text.secondary">{course.description}</Typography>
            </CardContent>
            <CardActions sx={{ justifyContent: 'flex-end', p: 2 }}>
                {course.isEnrolled ? (
                    <Button variant="contained" onClick={() => handleSeeCourse(course.id)}>Ver Curso</Button>
                ) : (
                    <Button variant="outlined" onClick={() => handleEnroll(course.id)}>Inscribirme</Button>
                )}
            </CardActions>
        </Card>
    );
};


export default function TrainingPage({ toggleDarkMode, currentMode }) {
  const { user, ready: authReady, token } = useAuthUser();
  const router = useRouter();
  
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const fetchCourses = useCallback(async () => {
    if (!token) {
        setLoading(false);
        return;
    };
    try {
        const res = await fetch(`${API_BASE}/training/courses`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('No se pudieron cargar los cursos.');
        const data = await res.json();
        setCourses(data);
    } catch (error) {
        setSnackbar({ open: true, message: error.message, severity: 'error' });
    } finally {
        setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (authReady) {
        if (user) {
            fetchCourses();
        } else {
            router.push('/login'); // O a la página de inicio de sesión que uses
        }
    }
  }, [authReady, user, router, fetchCourses]);

  if (!authReady || loading) {
    return <DashboardLayout><Container sx={{ textAlign: 'center', mt: 5 }}><CircularProgress /></Container></DashboardLayout>;
  }

  return (
    <DashboardLayout toggleDarkMode={toggleDarkMode} currentMode={currentMode}>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Formación y Capacitación
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Explora nuestros cursos y mejora tus habilidades profesionales.
        </Typography>
        <Grid container spacing={4}>
          {courses.map((course) => (
            <Grid item key={course.id} xs={12} sm={6} md={4}>
              <CourseCard course={course} />
            </Grid>
          ))}
        </Grid>
        <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar(s => ({...s, open: false}))}>
            <Alert onClose={() => setSnackbar(s => ({...s, open: false}))} severity={snackbar.severity} sx={{ width: '100%' }}>
                {snackbar.message}
            </Alert>
        </Snackbar>
      </Container>
    </DashboardLayout>
  );
}
