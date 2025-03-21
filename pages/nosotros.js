// pages/nosotros.js
import { Box, Container, Grid, Typography, Button } from '@mui/material';
import Link from 'next/link';
import MainLayout from '../components/MainLayout';

export default function Nosotros() {
  return (
    <MainLayout>
      <Box
        sx={{
          backgroundColor: '#103B40', // Fondo verde oscuro exacto
          minHeight: '100vh',
          py: 6, // Ajusta para reducir o aumentar espacio vertical
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="flex-start">
            {/* Columna Izquierda: Logo + Títulos */}
            <Grid item xs={12} md={4}>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4, // Espacio entre elementos
                }}
              >
                {/* Logo */}
                <Box>
                  <img
                    src="/images/fap-logo.png"
                    alt="FAP Logo"
                    style={{ width: '120px' }} // Ajusta tamaño según necesites
                  />
                </Box>

                {/* Título: Nosotros (mismo tamaño que el resto) */}
                <Typography
                  sx={{
                    fontFamily: "'Open Sans', sans-serif",
                    fontWeight: 700,
                    fontSize: '1.8rem', // Ajusta para igualar al PDF
                    color: '#fff',
                  }}
                >
                  Nosotros
                </Typography>

                {/* Misión y objetivo */}
                <Box>
                  <Typography
                    sx={{
                      fontFamily: "'Open Sans', sans-serif",
                      fontWeight: 700,
                      fontSize: '1.8rem',
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
                      fontSize: '1.8rem',
                      color: '#fff',
                      mt: 0.5,
                    }}
                  >
                    objetivo
                  </Typography>
                </Box>

                {/* Visión y valores */}
                <Box>
                  <Typography
                    sx={{
                      fontFamily: "'Open Sans', sans-serif",
                      fontWeight: 700,
                      fontSize: '1.8rem',
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
                      fontSize: '1.8rem',
                      color: '#fff',
                      mt: 0.5,
                    }}
                  >
                    valores
                  </Typography>
                </Box>
              </Box>
            </Grid>

            {/* Columna Derecha: Texto */}
            <Grid item xs={12} md={8}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {/* Párrafo 1 */}
                <Typography
                  sx={{
                    fontFamily: "'Open Sans', sans-serif",
                    fontSize: '1rem',
                    color: '#fff',
                    textAlign: 'justify',
                    lineHeight: 1.6,
                  }}
                >
                  En FAP Consultora, nos especializamos en la gestión de recursos humanos,
                  brindando soluciones personalizadas que potencian el talento y optimizan
                  el rendimiento organizacional. Trabajamos con un enfoque confiable,
                  flexible y colaborativo, promoviendo relaciones laborales basadas en la
                  transparencia y la empatía.
                </Typography>

                {/* Párrafo Misión y objetivo */}
                <Typography
                  sx={{
                    fontFamily: "'Open Sans', sans-serif",
                    fontSize: '1rem',
                    color: '#fff',
                    textAlign: 'justify',
                    lineHeight: 1.6,
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

                {/* Párrafo Visión y valores */}
                <Typography
                  sx={{
                    fontFamily: "'Open Sans', sans-serif",
                    fontSize: '1rem',
                    color: '#fff',
                    textAlign: 'justify',
                    lineHeight: 1.6,
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
              </Box>

              {/* Botón Volver al Inicio */}
              <Box sx={{ textAlign: 'center', mt: 5 }}>
                <Button component={Link} href="/" variant="contained" color="primary">
                  Volver al Inicio
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </MainLayout>
  );
}
