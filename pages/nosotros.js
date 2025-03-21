// pages/nosotros.js
import { Box, Container, Grid, Typography, Button } from '@mui/material';
import Link from 'next/link';
import MainLayout from '../components/MainLayout';

export default function Nosotros() {
  return (
    <MainLayout>
      <Box sx={{ backgroundColor: '#103B40', py: 6 }}>
        <Container maxWidth="lg">
          {/* Logo en la parte superior izquierda */}
          <Box sx={{ textAlign: 'left', mb: 4 }}>
            <img src="/images/fap-logo.png" alt="FAP Logo" style={{ width: '120px' }} />
          </Box>

          {/* Sección "Nosotros" */}
          <Grid container spacing={4} alignItems="flex-start">
            <Grid item xs={12} md={4}>
              <Typography
                variant="h4"
                sx={{
                  fontFamily: "'Open Sans', sans-serif",
                  fontWeight: 700,
                  color: '#fff',
                }}
              >
                Nosotros
              </Typography>
            </Grid>
            <Grid item xs={12} md={8}>
              <Typography
                variant="body1"
                sx={{
                  fontFamily: "'Open Sans', sans-serif",
                  fontSize: '1rem',
                  color: '#fff',
                  lineHeight: 1.6,
                }}
              >
                En FAP Consultora, nos especializamos en la gestión de recursos humanos, brindando soluciones personalizadas que potencian el talento y optimizan el rendimiento organizacional. Trabajamos con un enfoque confiable, flexible y colaborativo, promoviendo relaciones laborales basadas en la transparencia y la empatía.
              </Typography>
            </Grid>
          </Grid>

          {/* Sección "Misión y objetivo" */}
          <Grid container spacing={4} alignItems="flex-start" sx={{ mt: 6 }}>
            <Grid item xs={12} md={4}>
              <Typography
                variant="h4"
                sx={{
                  fontFamily: "'Open Sans', sans-serif",
                  fontWeight: 700,
                  color: '#fff',
                }}
              >
                Misión y objetivo
              </Typography>
            </Grid>
            <Grid item xs={12} md={8}>
              <Typography
                variant="body1"
                sx={{
                  fontFamily: "'Open Sans', sans-serif",
                  fontSize: '1rem',
                  color: '#fff',
                  lineHeight: 1.6,
                }}
              >
                Colaborar con empresas para mejorar la gestión de sus recursos humanos, ofreciendo estrategias a medida que impulsen un ambiente de trabajo motivador y productivo. Optimizar la gestión del capital humano para mejorar el rendimiento organizacional y el bienestar de los empleados, generando entornos laborales más eficientes y armoniosos.
              </Typography>
            </Grid>
          </Grid>

          {/* Sección "Visión y valores" */}
          <Grid container spacing={4} alignItems="flex-start" sx={{ mt: 6 }}>
            <Grid item xs={12} md={4}>
              <Typography
                variant="h4"
                sx={{
                  fontFamily: "'Open Sans', sans-serif",
                  fontWeight: 700,
                  color: '#fff',
                }}
              >
                Visión y valores
              </Typography>
            </Grid>
            <Grid item xs={12} md={8}>
              <Typography
                variant="body1"
                sx={{
                  fontFamily: "'Open Sans', sans-serif",
                  fontSize: '1rem',
                  color: '#fff',
                  lineHeight: 1.6,
                }}
              >
                Ser la consultora de referencia en Valle de Uco y Mendoza, reconocida por nuestra excelencia, experiencia y capacidad para contribuir al crecimiento profesional y personal de individuos y organizaciones. Nos guiamos por la solidaridad, la fidelidad y la unión, comprometiéndonos con el bienestar de las personas y el éxito de cada empresa con la que trabajamos.
              </Typography>
            </Grid>
          </Grid>

          {/* Botón "Volver al Inicio" */}
          <Box sx={{ textAlign: 'left', mt: 6 }}>
            <Button component={Link} href="/" variant="contained" color="primary">
              Volver al Inicio
            </Button>
          </Box>
        </Container>
      </Box>
    </MainLayout>
  );
}
