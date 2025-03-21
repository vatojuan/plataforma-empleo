// pages/nosotros.js
import { Box, Container, Typography, Button } from '@mui/material';
import Link from 'next/link';
import MainLayout from '../components/MainLayout';

export default function Nosotros() {
  return (
    <MainLayout>
      <Box
        sx={{
          backgroundColor: '#103B40', // Fondo exacto del PDF
          minHeight: '100vh',
          pt: 8,
          pb: 6,
          position: 'relative',
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

        <Container maxWidth="md">
          {/* Título "Nosotros" */}
          <Typography
            variant="h2"
            align="center"
            sx={{
              fontFamily: "'Bodoni Moda', serif",
              color: '#fff',
              mb: 4,
            }}
          >
            Nosotros
          </Typography>

          {/* Texto introductorio */}
          <Typography
            variant="body1"
            align="justify"
            sx={{
              fontFamily: "'Bodoni Moda', serif",
              fontSize: '1.2rem',
              color: '#fff',
              mb: 6,
              lineHeight: 1.6,
            }}
          >
            En FAP Consultora, nos especializamos en la gestión de recursos humanos,
            brindando soluciones personalizadas que potencian el talento y optimizan
            el rendimiento organizacional. Trabajamos con un enfoque confiable,
            flexible y colaborativo, promoviendo relaciones laborales basadas en la
            transparencia y la empatía.
          </Typography>

          {/* Sección: Misión y objetivo */}
          <Box sx={{ mb: 6 }}>
            <Typography
              variant="h4"
              sx={{
                fontFamily: "'Bodoni Moda', serif",
                color: '#fff',
                mb: 2,
              }}
            >
              Misión y objetivo
            </Typography>
            <Typography
              variant="body1"
              align="justify"
              sx={{
                fontFamily: "'Bodoni Moda', serif",
                fontSize: '1.2rem',
                color: '#fff',
                lineHeight: 1.6,
              }}
            >
              Colaborar con empresas para mejorar la gestión de sus recursos humanos,
              ofreciendo estrategias a medida que impulsen un ambiente de trabajo
              motivador y productivo.
              <br /><br />
              Optimizar la gestión del capital humano para mejorar el rendimiento
              organizacional y el bienestar de los empleados, generando entornos
              laborales más eficientes y armoniosos.
            </Typography>
          </Box>

          {/* Sección: Visión y valores */}
          <Box sx={{ mb: 6 }}>
            <Typography
              variant="h4"
              sx={{
                fontFamily: "'Bodoni Moda', serif",
                color: '#fff',
                mb: 2,
              }}
            >
              Visión y valores
            </Typography>
            <Typography
              variant="body1"
              align="justify"
              sx={{
                fontFamily: "'Bodoni Moda', serif",
                fontSize: '1.2rem',
                color: '#fff',
                lineHeight: 1.6,
              }}
            >
              Ser la consultora de referencia en Valle de Uco y Mendoza, reconocida por
              nuestra excelencia, experiencia y capacidad para contribuir al crecimiento
              profesional y personal de individuos y organizaciones.
              <br /><br />
              Nos guiamos por la solidaridad, la fidelidad y la unión, comprometiéndonos
              con el bienestar de las personas y el éxito de cada empresa con la que
              trabajamos.
            </Typography>
          </Box>

          {/* Botón "Volver al Inicio" ubicado entre el contenido y el Footer */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Button component={Link} href="/" variant="contained" color="primary">
              Volver al Inicio
            </Button>
          </Box>
        </Container>
      </Box>
    </MainLayout>
  );
}
