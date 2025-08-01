import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import {
  Container, Typography, Grid, Snackbar, Alert, CircularProgress, Box, Card,
  CardContent, CardActions, Button, CardMedia
} from '@mui/material';
import DashboardLayout from '../components/DashboardLayout'; // Usando tu layout principal
import useAuthUser from '../hooks/useAuthUser'; // Usando tu hook de autenticación

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://api.fapmendoza.online";

// --- Componente de Tarjeta de Curso reutilizable ---
// Este componente encapsula la lógica y presentación de cada curso.
const CourseCard = ({ course }) => {
    const router = useRouter();

    /**
     * Redirige al usuario a la página de detalle del curso.
     * @param {string} courseId - El ID del curso.
     */
    const handleSeeCourse = (courseId) => {
        router.push(`/cursos/${courseId}`);
    };

    /**
     * Inscribe al usuario en un curso y recarga la página para reflejar el cambio.
     * @param {string} courseId - El ID del curso a inscribirse.
     */
    const handleEnroll = async (courseId) => {
        const token = localStorage.getItem('userToken');
        if (!token) {
            console.error("No hay token de autenticación para realizar la inscripción.");
            // Opcional: Mostrar un snackbar de error.
            return;
        }
        try {
            const res = await fetch(`${API_BASE}/training/enroll/${courseId}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.detail || 'Error en la inscripción.');
            }
            // Recargar la página es una forma simple de asegurar que el estado se actualice.
            router.reload();
        } catch (error) {
            console.error("Error al inscribirse:", error);
            // Opcional: Mostrar un snackbar con el mensaje de error.
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


/**
 * Página principal de Formación para usuarios.
 * Muestra la lista de cursos disponibles y permite la inscripción.
 */
export default function TrainingPage({ toggleDarkMode, currentMode }) {
  // --- 1. Hooks y Estado ---
  const { user, ready: authReady, token } = useAuthUser();
  const router = useRouter();
  
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // --- 2. Lógica de Datos ---
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

  // --- 3. Efectos ---
  useEffect(() => {
    // Este efecto maneja la autenticación y la carga inicial de datos.
    if (authReady) {
        if (user) {
            fetchCourses();
        } else {
            // Si el usuario no está autenticado, se redirige al login.
            router.push('/login');
        }
    }
  }, [authReady, user, router, fetchCourses]);

  // --- 4. Renderizado ---
  if (!authReady || loading) {
    return (
        <DashboardLayout>
            <Container sx={{ textAlign: 'center', mt: 5 }}>
                <CircularProgress />
            </Container>
        </DashboardLayout>
    );
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
        
        {courses.length > 0 ? (
            <Grid container spacing={4}>
            {courses.map((course) => (
                <Grid item key={course.id} xs={12} sm={6} md={4}>
                <CourseCard course={course} />
                </Grid>
            ))}
            </Grid>
        ) : (
            <Paper sx={{ p: 4, textAlign: 'center', mt: 4 }}>
                <Typography variant="h6">No hay cursos disponibles</Typography>
                <Typography color="text.secondary">Vuelve a consultar más tarde para ver nuevas oportunidades de formación.</Typography>
            </Paper>
        )}

        <Snackbar 
            open={snackbar.open} 
            autoHideDuration={4000} 
            onClose={() => setSnackbar(s => ({...s, open: false}))}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
            <Alert onClose={() => setSnackbar(s => ({...s, open: false}))} severity={snackbar.severity} sx={{ width: '100%' }} variant="filled">
                {snackbar.message}
            </Alert>
        </Snackbar>
      </Container>
    </DashboardLayout>
  );
}
