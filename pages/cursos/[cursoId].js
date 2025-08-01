import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import {
  Box, Container, Typography, CircularProgress, List, ListItem, ListItemIcon,
  ListItemText, Paper, Divider, Button, Grid, Snackbar, Alert
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import DashboardLayout from '../../components/DashboardLayout';
import useAuthUser from '../../hooks/useAuthUser';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://api.fapmendoza.online";

export default function CursoDetallePage({ toggleDarkMode, currentMode }) {
  const { user, ready: authReady, token } = useAuthUser();
  const router = useRouter();
  const { cursoId } = router.query;

  const [course, setCourse] = useState(null);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const fetchDetails = useCallback(async () => {
    if (!cursoId || !token) return;
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/training/courses/${cursoId}/details`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error((await res.json()).detail || 'Error al cargar detalles');
      
      const data = await res.json();
      setCourse(data);
      
      const firstUncompleted = data.lessons.find(l => !l.isCompleted);
      setSelectedLesson(firstUncompleted || data.lessons[0] || null);
    } catch (err) {
      setSnackbar({ open: true, message: err.message, severity: 'error' });
    } finally {
      setLoading(false);
    }
  }, [cursoId, token]);

  useEffect(() => {
    if (authReady) {
        if (user) fetchDetails();
        else router.push('/login');
    }
  }, [authReady, user, router, fetchDetails]);

  const handleMarkAsComplete = async () => {
    if (!selectedLesson || !token) return;
    try {
        const res = await fetch(`${API_BASE}/training/lessons/${selectedLesson.id}/complete`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error((await res.json()).detail || 'Error al marcar la lección');
        
        fetchDetails();
        setSnackbar({ open: true, message: '¡Lección completada!', severity: 'success' });
    } catch (err) {
        setSnackbar({ open: true, message: err.message, severity: 'error' });
    }
  };

  if (!authReady || loading) {
    return <DashboardLayout><Container sx={{ textAlign: 'center', mt: 5 }}><CircularProgress /></Container></DashboardLayout>;
  }

  if (!course) {
    return <DashboardLayout><Container><Typography sx={{ mt: 4 }}>Curso no encontrado.</Typography></Container></DashboardLayout>;
  }

  return (
    <DashboardLayout toggleDarkMode={toggleDarkMode} currentMode={currentMode}>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>{course.title}</Typography>
        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 2 }}>
              {selectedLesson ? (
                <Box>
                  <Typography variant="h6" gutterBottom>{selectedLesson.title}</Typography>
                  <Box sx={{ position: 'relative', paddingTop: '56.25%', backgroundColor: '#000' }}>
                    <video
                      key={selectedLesson.id}
                      controls
                      src={selectedLesson.videoUrl}
                      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                      // Añadir un onError para el video
                      onError={(e) => { console.error("Error al cargar el video:", e); }}
                    />
                  </Box>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    onClick={handleMarkAsComplete}
                    disabled={selectedLesson.isCompleted}
                    sx={{ mt: 2 }}
                  >
                    {selectedLesson.isCompleted ? 'Lección Completada' : 'Marcar como Completada'}
                  </Button>
                </Box>
              ) : (
                <Typography>Selecciona una lección para comenzar o el curso no tiene lecciones.</Typography>
              )}
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2, maxHeight: '80vh', overflowY: 'auto' }}>
              <Typography variant="h6" gutterBottom>Lecciones</Typography>
              <List>
                {course.lessons.map((lesson) => (
                  <ListItem 
                    key={lesson.id} 
                    button 
                    onClick={() => setSelectedLesson(lesson)}
                    selected={selectedLesson?.id === lesson.id}
                    sx={{ mb: 1, border: '1px solid #ddd', borderRadius: 1 }}
                  >
                    <ListItemIcon>
                      {lesson.isCompleted ? <CheckCircleIcon color="success" /> : <PlayCircleOutlineIcon />}
                    </ListItemIcon>
                    <ListItemText primary={lesson.title} secondary={`Lección ${lesson.orderIndex + 1}`} />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>
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
