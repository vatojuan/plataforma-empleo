// pages/nosotros.js
import { Box, Container, Typography, Grid, Button } from '@mui/material';
import Link from 'next/link';
import MainLayout from '../components/MainLayout';

export default function Nosotros() {
  return (
    <MainLayout>
      <Box
        sx={{
          backgroundColor: '#103B40', // Fondo exacto del PDF
          minHeight: '100vh',
          position: 'relative',
          py: 10,
        }}
      >
        {/* Logo FAP en la esquina superior izquierda */}
        <Box sx={{ position: 'absolute', top: 16, left: 16 }}>
          <img
            src="/images/fap-logo.png"
            alt="FAP Logo"
            style={{ maxWidth: '150px', width: '100%' }}
          />
        </Box>

        <Container maxWidth="lg">
          <Grid container spacing={4}>
            {/* Columna Izquierda: Títulos */}
            <Grid item xs={12} md={4}>
              {/* "Nosotros" */}
              <Typography
                sx={{
                  fontFamily: "'Open Sans', sans-serif",
                  fontWeight: 700,
                  fontSize: '2rem', // Ajustar según necesites
                  color: '#fff',
                  mb: 5,
                }}
              >
                Nosotros
              </Typography>

              {/* "Misión y objetivo" en dos líneas */}
              <Box sx={{ mb: 5 }}>
                <Typography
                  sx={{
                    fontFamily: "'Open Sans', sans-serif",
                    fontWeight: 700,
                    fontSize: '1.6rem',
                    color: '#fff',
                    lineHeight: 1.2,
                  }}
                >
                  Misión y
                </Typography>
                <Typography
                  sx={{
                    fontFamily: "'Open Sans', sans-serif",
                    fontWeight: 700,
                    fontSize: '1.6rem',
                    color: '#fff',
                  }}
                >
                  objetivo
                </Typography>
              </Box>

              {/* "Visión y valores" en dos líneas */}
              <Box>
                <Typography
                  sx={{
                    fontFamily: "'Open Sans', sans-serif",
                    fontWeight: 700,
                    fontSize: '1.6rem',
                    color: '#fff',
                    lineHeight: 1.2,
                  }}
                >
                  Visión y
                </Typography>
                <Typography
                  sx={{
                    fontFamily: "'Open Sans', sans-serif",
                    fontWeight: 700,
                    fontSize: '1.6rem',
                    color: '#fff',
                  }}
                >
                  valores
                </Typography>
              </Box>
            </Grid>

            {/* Columna Derecha: Texto descriptivo */}
            <Grid item xs={12} md={8}>
              <Typography
                sx={{
                  fontFamily: "'Open Sans', sans-serif",
                  fontSize: '1rem',
                  color: '#fff',
                  lineHeight: 1.6,
                  mb: 3,
                  textAlign: 'justify',
                }}
              >
                En FAP Consultora, nos especializamos en la gestión de recursos humanos,
                brindando soluciones personalizadas que potencian el talento y optimizan
                el rendimiento organizacional. Trabajamos con un enfoque confiable,
                flexible y colaborativo, promoviendo relaciones laborales basadas en la
                transparencia y la empatía.
              </Typography>

              {/* Texto de Misión y objetivo */}
              <Typography
                sx={{
                  fontFamily: "'Open Sans', sans-serif",
                  fontSize: '1rem',
                  color: '#fff',
                  lineHeight: 1.6,
                  mb: 3,
                  textAlign: 'justify',
                }}
              >
                Colaborar con empresas para mejorar la gestión de sus recursos humanos,
                ofreciendo estrategias a medida que impulsen un ambiente de trabajo
                motivador y productivo.
                <br />
                <br />
                Optimizar la gestión del capital humano para mejorar el rendimiento
                organizacional y el bienestar de los empleados, generando entornos
                laborales más eficientes y armoniosos.
              </Typography>

              {/* Texto de Visión y valores */}
              <Typography
                sx={{
                  fontFamily: "'Open Sans', sans-serif",
                  fontSize: '1rem',
                  color: '#fff',
                  lineHeight: 1.6,
                  textAlign: 'justify',
                }}
              >
                Ser la consultora de referencia en Valle de Uco y Mendoza, reconocida por
                nuestra excelencia, experiencia y capacidad para contribuir al crecimiento
                profesional y personal de individuos y organizaciones.
                <br />
                <br />
                Nos guiamos por la solidaridad, la fidelidad y la unión, comprometiéndonos
                con el bienestar de las personas y el éxito de cada empresa con la que
                trabajamos.
              </Typography>
            </Grid>
          </Grid>

          {/* Botón "Volver al Inicio" */}
          <Box sx={{ textAlign: 'center', mt: 6 }}>
            <Button component={Link} href="/" variant="contained" color="primary">
              Volver al Inicio
            </Button>
          </Box>
        </Container>
      </Box>
    </MainLayout>
  );
}
