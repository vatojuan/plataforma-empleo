// pages/nosotros.js
import { Box, Container, Grid, Typography, Button } from '@mui/material';
import Link from 'next/link';
import MainLayout from '../components/MainLayout';

export default function Nosotros() {
  return (
    <MainLayout>
      <Box sx={{ backgroundColor: '#103B40', py: 4 }}>
        {/* Logo en la parte superior izquierda */}
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'left', mb: 2 }}>
            <img src="/images/fap-logo.png" alt="FAP Logo" style={{ width: '120px' }} />
          </Box>
        </Container>
        
        {/* Contenedor central */}
        <Container maxWidth="lg" sx={{ mt: 2, ml: { md: '150px' } }}>
          <Grid container spacing={2} alignItems="flex-start">
            {/* Sección "Nosotros" */}
            <Grid item xs={12} md={4}>
              <Typography
                variant="h4"
                align="left"
                sx={{
                  fontFamily: "'Open Sans', sans-serif",
                  fontWeight: 700,
                  color: '#fff',
                  mb: 1,
                  fontSize: '3.6rem', // Doble tamaño
                }}
              >
                Nosotros
              </Typography>
            </Grid>
            <Grid item xs={12} md={8}>
              <Typography
                variant="body1"
                align="justify"
                sx={{
                  fontFamily: "'Open Sans', sans-serif",
                  fontSize: '1rem',
                  color: '#fff',
                  lineHeight: 1.5,
                  mb: 2,
                }}
              >
                En FAP Consultora, nos especializamos en la gestión de recursos humanos, brindando soluciones personalizadas que potencian el talento y optimizan el rendimiento organizacional. Trabajamos con un enfoque confiable, flexible y colaborativo, promoviendo relaciones laborales basadas en la transparencia y la empatía.
              </Typography>
            </Grid>

            {/* Sección "Misión y objetivo" */}
            <Grid item xs={12} md={4}>
              <Typography
                variant="h4"
                align="left"
                sx={{
                  fontFamily: "'Open Sans', sans-serif",
                  fontWeight: 700,
                  color: '#fff',
                  mb: 0.3,
                  fontSize: '3.6rem',
                }}
              >
                Misión y
              </Typography>
              <Typography
                variant="h4"
                align="left"
                sx={{
                  fontFamily: "'Open Sans', sans-serif",
                  fontWeight: 700,
                  color: '#fff',
                  mb: 1.5,
                  fontSize: '3.6rem',
                }}
              >
                objetivo
              </Typography>
            </Grid>
            <Grid item xs={12} md={8}>
              <Typography
                variant="body1"
                align="justify"
                sx={{
                  fontFamily: "'Open Sans', sans-serif",
                  fontSize: '1rem',
                  color: '#fff',
                  lineHeight: 1.5,
                  mb: 2,
                }}
              >
                Colaborar con empresas para mejorar la gestión de sus recursos humanos, ofreciendo estrategias a medida que impulsen un ambiente de trabajo motivador y productivo. Optimizar la gestión del capital humano para mejorar el rendimiento organizacional y el bienestar de los empleados, generando entornos laborales más eficientes y armoniosos.
              </Typography>
            </Grid>

            {/* Sección "Visión y valores" */}
            <Grid item xs={12} md={4}>
              <Typography
                variant="h4"
                align="left"
                sx={{
                  fontFamily: "'Open Sans', sans-serif",
                  fontWeight: 700,
                  color: '#fff',
                  mb: 0.3,
                  fontSize: '3.6rem',
                }}
              >
                Visión y
              </Typography>
              <Typography
                variant="h4"
                align="left"
                sx={{
                  fontFamily: "'Open Sans', sans-serif",
                  fontWeight: 700,
                  color: '#fff',
                  mb: 2,
                  fontSize: '3.6rem',
                }}
              >
                valores
              </Typography>
            </Grid>
            <Grid item xs={12} md={8}>
              <Typography
                variant="body1"
                align="justify"
                sx={{
                  fontFamily: "'Open Sans', sans-serif",
                  fontSize: '1rem',
                  color: '#fff',
                  lineHeight: 1.5,
                  mb: 2,
                }}
              >
                Ser la consultora de referencia en Valle de Uco y Mendoza, reconocida por nuestra excelencia, experiencia y capacidad para contribuir al crecimiento profesional y personal de individuos y organizaciones. Nos guiamos por la solidaridad, la fidelidad y la unión, comprometiéndonos con el bienestar de las personas y el éxito de cada empresa con la que trabajamos.
              </Typography>
            </Grid>
          </Grid>

          {/* Botón "Volver al Inicio" centrado al final */}
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Button component={Link} href="/" variant="contained" color="primary">
              Volver al Inicio
            </Button>
          </Box>
        </Container>
      </Box>
    </MainLayout>
  );
}
