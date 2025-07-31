import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Box, Container, Typography, CircularProgress, List, ListItem, ListItemIcon,
  ListItemText, Paper, Divider
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import UserDashboardLayout from '../../components/UserDashboardLayout'; // Asumo que tienes un layout para usuarios
import useAuth from '../../hooks/useAuth'; // Asumo que tienes un hook de autenticación para usuarios

// Función para llamar a la API
const getCourseDetails = async (courseId, token) => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/training/courses/${courseId}/details`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || 'Error al cargar los detalles del curso');
  }
  return res.json();
};


export default function CursoDetallePage() {
  const { user, loading: authLoading } = useAuth(); // Hook de autenticación de usuario normal
  const router = useRouter();
  const { cursoId } = router.query;

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDetails = async () => {
      if (!cursoId) return;
      
      const token = localStorage.getItem('authToken'); // Token del usuario normal
      if (!token) {
        setError('Debes iniciar sesión para ver este curso.');
        setLoading(false);
        return;
      }

      try {
        const data = await getCourseDetails(cursoId, token);
        setCourse(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading && user) {
      fetchDetails();
    } else if (!authLoading && !user) {
        router.push('/login'); // Redirigir si no está autenticado
    }

  }, [cursoId, authLoading, user, router]);

  if (loading || authLoading) {
    return (
      <UserDashboardLayout>
        <Container sx={{ textAlign: 'center', mt: 5 }}>
          <CircularProgress />
        </Container>
      </UserDashboardLayout>
    );
  }

  if (error) {
    return (
        <UserDashboardLayout>
            <Container>
                <Typography color="error" sx={{ mt: 4 }}>{error}</Typography>
            </Container>
        </UserDashboardLayout>
    );
  }

  if (!course) {
    return (
        <UserDashboardLayout>
            <Container>
                <Typography sx={{ mt: 4 }}>Curso no encontrado.</Typography>
            </Container>
        </UserDashboardLayout>
    );
  }

  return (
    <UserDashboardLayout>
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h4" gutterBottom>{course.title}</Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            {course.description}
          </Typography>
          
          <Divider />

          <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>Lecciones</Typography>
          <List>
            {course.lessons.map((lesson) => (
              <ListItem 
                key={lesson.id} 
                button 
                // Aquí añadiremos la lógica para reproducir el video en el siguiente paso
                // onClick={() => handleSelectLesson(lesson)}
                sx={{ 
                    mb: 1, 
                    border: '1px solid #ddd', 
                    borderRadius: 1,
                    backgroundColor: lesson.isCompleted ? 'action.hover' : 'transparent'
                }}
              >
                <ListItemIcon>
                  {lesson.isCompleted ? 
                    <CheckCircleIcon color="success" /> : 
                    <RadioButtonUncheckedIcon color="disabled" />
                  }
                </ListItemIcon>
                <ListItemText 
                  primary={lesson.title} 
                  secondary={`Lección ${lesson.orderIndex + 1}`} 
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      </Container>
    </UserDashboardLayout>
  );
}
