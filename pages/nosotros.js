// pages/nosotros.js
import { Box, Container, Grid, Typography, Button } from '@mui/material';
import Link from 'next/link';
import MainLayout from '../components/MainLayout';

export default function Nosotros() {
  return (
    <MainLayout>
      <Box sx={{ backgroundColor: '#103B40', py: 4, minHeight: '100vh' }}>
        <Container maxWidth="lg">
          {/* Logo en la parte superior izquierda */}
          <Box sx={{ textAlign: 'left', mb: 2 }}>
            <img src="/images/fap-logo.png" alt="FAP Logo" style={{ width: '120px' }} />
          </Box>

          <Grid container spacing={2} alignItems="flex-start">
            {/* Sección "Nosotros" */}
            <Grid item xs={12} md={4} sx={{ maxWidth: { md: '220px' } }}>
              <Typography
                variant="h4"
                align="left"
                sx={{
                  fontFamily: "'Open Sans', sans-serif",
                  fontWeight: 700,
                  color: '#fff',
                  mb: 0.5,
                  fontSize: '1.8rem',
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
                  fontSize: '0.95rem',
                  color: '#fff',
                  lineHeight: 1.5,
                }}
              >
                En FAP Consultora, nos especializamos en la gestión de recursos humanos, brindando soluciones personalizadas que potencian el talento y optimizan el rendimiento organizacional. Trabajamos con un enfoque confiable, flexible y colaborativo, promoviendo relaciones laborales basadas en la transparencia y la empatía.
              </Typography>
            </Grid>

            {/* Sección "Misión y objetivo" */}
            <Grid item xs={12} md={4} sx={{ maxWidth: { md: '220px' } }}>
              <Typography
                variant="h4"
                align="left"
                sx={{
                  fontFamily: "'Open Sans', sans-serif",
                  fontWeight: 700,
                  color: '#fff',
                  mb: 0.3,
                  fontSize: '1.8rem',
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
                  fontSize: '1.8rem',
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
                  fontSize: '0.95rem',
                  color: '#fff',
                  lineHeight: 1.5,
                }}
              >
                Colaborar con empresas para mejorar la gestión de sus recursos humanos, ofreciendo estrategias a medida que impulsen un ambiente de trabajo motivador y productivo. Optimizar la gestión del capital humano para mejorar el rendimiento organizacional y el bienestar de los empleados, generando entornos laborales más eficientes y armoniosos.
              </Typography>
            </Grid>

            {/* Sección "Visión y valores" */}
            <Grid item xs={12} md={4} sx={{ maxWidth: { md: '220px' } }}>
              <Typography
                variant="h4"
                align="left"
                sx={{
                  fontFamily: "'Open Sans', sans-serif",
                  fontWeight: 700,
                  color: '#fff',
                  mb: 0.3,
                  fontSize: '1.8rem',
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
                  fontSize: '1.8rem',
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
                  fontSize: '0.95rem',
                  color: '#fff',
                  lineHeight: 1.5,
                }}
              >
                Ser la consultora de referencia en Valle de Uco y Mendoza, reconocida por nuestra excelencia, experiencia y capacidad para contribuir al crecimiento profesional y personal de individuos y organizaciones. Nos guiamos por la solidaridad, la fidelidad y la unión, comprometiéndonos con el bienestar de las personas y el éxito de cada empresa con la que trabajamos.
              </Typography>
            </Grid>
          </Grid>

          {/* Botón "Volver al Inicio" */}
          <Box sx={{ textAlign: 'left', mt: 4 }}>
            <Button component={Link} href="/" variant="contained" color="primary">
              Volver al Inicio
            </Button>
          </Box>
        </Container>
      </Box>
    </MainLayout>
  );
}
