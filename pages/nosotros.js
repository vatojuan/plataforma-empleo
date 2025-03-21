// pages/nosotros.js
import { Box, Container, Typography, Button } from '@mui/material';
import Link from 'next/link';
import MainLayout from '../components/MainLayout';

export default function Nosotros() {
  return (
    <MainLayout>
      <Box sx={{ backgroundColor: '#103B40', py: 6 }}>
        <Container maxWidth="md">
          {/* Logo en la parte superior izquierda, dentro del flujo */}
          <Box sx={{ textAlign: 'left', mb: 3 }}>
            <img
              src="/images/fap-logo.png"
              alt="FAP Logo"
              style={{ width: '120px' }}
            />
          </Box>

          {/* Título "Nosotros" */}
          <Typography
            variant="h3"
            align="center"
            sx={{
              fontFamily: "'Open Sans', sans-serif",
              fontWeight: 700,
              color: '#fff',
              mb: 3,
            }}
          >
            Nosotros
          </Typography>

          {/* Texto introductorio */}
          <Typography
            variant="body1"
            align="justify"
            sx={{
              fontFamily: "'Open Sans', sans-serif",
              fontSize: '1rem',
              color: '#fff',
              mb: 4,
              lineHeight: 1.6,
            }}
          >
            En FAP Consultora, nos especializamos en la gestión de recursos humanos, brindando soluciones personalizadas que potencian el talento y optimizan el rendimiento organizacional. Trabajamos con un enfoque confiable, flexible y colaborativo, promoviendo relaciones laborales basadas en la transparencia y la empatía.
          </Typography>

          {/* Título: Misión y objetivo (dos líneas) */}
          <Typography
            variant="h3"
            align="center"
            sx={{
              fontFamily: "'Open Sans', sans-serif",
              fontWeight: 700,
              color: '#fff',
              mb: 1,
            }}
          >
            Misión y
          </Typography>
          <Typography
            variant="h3"
            align="center"
            sx={{
              fontFamily: "'Open Sans', sans-serif",
              fontWeight: 700,
              color: '#fff',
              mb: 3,
            }}
          >
            objetivo
          </Typography>

          {/* Texto de Misión y objetivo */}
          <Typography
            variant="body1"
            align="justify"
            sx={{
              fontFamily: "'Open Sans', sans-serif",
              fontSize: '1rem',
              color: '#fff',
              mb: 4,
              lineHeight: 1.6,
            }}
          >
            Colaborar con empresas para mejorar la gestión de sus recursos humanos, ofreciendo estrategias a medida que impulsen un ambiente de trabajo motivador y productivo. Optimizar la gestión del capital humano para mejorar el rendimiento organizacional y el bienestar de los empleados, generando entornos laborales más eficientes y armoniosos.
          </Typography>

          {/* Título: Visión y valores (dos líneas) */}
          <Typography
            variant="h3"
            align="center"
            sx={{
              fontFamily: "'Open Sans', sans-serif",
              fontWeight: 700,
              color: '#fff',
              mb: 1,
            }}
          >
            Visión y
          </Typography>
          <Typography
            variant="h3"
            align="center"
            sx={{
              fontFamily: "'Open Sans', sans-serif",
              fontWeight: 700,
              color: '#fff',
              mb: 3,
            }}
          >
            valores
          </Typography>

          {/* Texto de Visión y valores */}
          <Typography
            variant="body1"
            align="justify"
            sx={{
              fontFamily: "'Open Sans', sans-serif",
              fontSize: '1rem',
              color: '#fff',
              mb: 4,
              lineHeight: 1.6,
            }}
          >
            Ser la consultora de referencia en Valle de Uco y Mendoza, reconocida por nuestra excelencia, experiencia y capacidad para contribuir al crecimiento profesional y personal de individuos y organizaciones. Nos guiamos por la solidaridad, la fidelidad y la unión, comprometiéndonos con el bienestar de las personas y el éxito de cada empresa con la que trabajamos.
          </Typography>

          {/* Botón "Volver al Inicio" */}
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
