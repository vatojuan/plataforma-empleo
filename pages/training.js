import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import {
  Container, Typography, Grid, Snackbar, Alert, CircularProgress, Box, Card,
  CardContent, CardActions, Button, CardMedia
} from '@mui/material';
import DashboardLayout from '../components/DashboardLayout';
import useAuthUser from '../hooks/useAuthUser';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://api.fapmendoza.online";

// --- Componente de Tarjeta de Curso reutilizable ---
// Se pasa la función onEnroll desde el componente padre para que tenga acceso al token correcto.
const CourseCard = ({ course, onEnroll }) => {
    const router = useRouter();

    const handleSeeCourse = (courseId) => {
        router.push(`/cursos/${courseId}`);
    };

    return (
        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardMedia
                component="img"
                height="140"
                // Si course.imageUrl no existe (porque no se subió en el panel de admin),
                // se usará una imagen de reemplazo.
                image={course.imageUrl || 'https://placehold.co/600x400/4E342E/FFF?text=Curso'}
                alt={`Portada de ${course.title}`}
                // Este onError se activará si la URL de la imagen está rota.
                onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/600x400/4E342E/FFF?text=Error'; }}
            />
            <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h5" component="div">{course.title}</Typography>
                <Typography variant="body2" color="text.secondary">{course.description}</Typography>
            </CardContent>
            <CardActions sx={{ justifyContent: 'flex-end', p: 2 }}>
                {course.isEnrolled ? (
                    <Button variant="contained" onClick={() => handleSeeCourse(course.id)}>Ver Curso</Button>
                ) : (
                    <Button variant="outlined" onClick={() => onEnroll(course.id)}>Inscribirme</Button>
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
            router.push('/login');
        }
    }
  }, [authReady, user, router, fetchCourses]);

  // --- LÓGICA DE INSCRIPCIÓN CORREGIDA ---
  // La función ahora vive en el componente principal, donde tiene acceso al 'token' del hook.
  const handleEnroll = useCallback(async (courseId) => {
    if (!token) {
        setSnackbar({ open: true, message: 'Debes iniciar sesión para inscribirte.', severity: 'error' });
        return;
    }
    try {
        const res = await fetch(`${API_BASE}/training/enroll/${courseId}`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error((await res.json()).detail || 'Error en la inscripción.');
        
        setSnackbar({ open: true, message: '¡Inscripción exitosa!', severity: 'success' });
        // Recargar los cursos para que el botón cambie a "Ver Curso".
        fetchCourses();
    } catch (error) {
        setSnackbar({ open: true, message: error.message, severity: 'error' });
    }
  }, [token, fetchCourses]);

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
        
        {courses.length > 0 ? (
            <Grid container spacing={4}>
            {courses.map((course) => (
                <Grid item key={course.id} xs={12} sm={6} md={4}>
                    <CourseCard course={course} onEnroll={handleEnroll} />
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
