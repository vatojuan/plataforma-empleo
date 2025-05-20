// pages/soluciones/branding.js
import { Container, Typography, IconButton, Grid, Card, CardContent, Box } from '@mui/material';
import MainLayout from '../../components/MainLayout';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useRouter } from 'next/router';

export default function Branding() {
  const router = useRouter();

  const handleArrowClick = () => {
    router.push('/soluciones/outsourcing');
  };

  const beneficios = [
    "Atracción de talento calificado",
    "Mayor compromiso y productividad",
    "Menor rotación de personal",
    "Mejor reputación empresarial",
  ];

  const servicios = [
    "Diagnóstico y desarrollo de estrategias de Employer Branding",
    "Comunicación interna y programas de reconocimiento",
    "Cultura organizacional y experiencia del empleado",
  ];

  return (
    <MainLayout>
      {/* Header con título y flecha de avance */}
      <Container 
        maxWidth="lg" 
        sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 2 }}
      >
        <Typography variant="h5" sx={{ color: 'primary.main' }}>
          Employer Branding & Engagement
        </Typography>
        <IconButton onClick={handleArrowClick}>
          <ArrowForwardIosIcon fontSize="large" />
        </IconButton>
      </Container>

      {/* Contenido principal */}
      <Container sx={{ mt: 4 }}>
        <Typography variant="h3" gutterBottom>
          Construí tu marca empleadora
        </Typography>
        <Typography variant="body1" paragraph>
          En FAP, ayudamos a las empresas a fortalecer su marca empleadora y potenciar el compromiso
          de sus empleados, creando un entorno de trabajo atractivo y motivador.
        </Typography>

        {/* ¿Por qué es importante? */}
        <Box sx={{ my: 4 }}>
          <Typography variant="h5" gutterBottom>
            ¿Por qué es importante?
          </Typography>
          <Typography variant="body1" paragraph>
            Una marca empleadora sólida permite atraer talento calificado, fomentar el compromiso y satisfacción del equipo,
            aumentar la productividad y reducir la rotación. ¡Tu reputación como empleador es clave!
          </Typography>
        </Box>

        {/* Nuestros Servicios */}
        <Box sx={{ my: 4 }}>
          <Typography variant="h5" gutterBottom>
            Nuestros Servicios
          </Typography>
          <Grid container spacing={2}>
            {servicios.map((servicio, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Card elevation={3}>
                  <CardContent>
                    <Typography variant="body1">{servicio}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Beneficios */}
        <Box sx={{ my: 4 }}>
          <Typography variant="h5" gutterBottom>
            Beneficios para tu empresa
          </Typography>
          <Grid container spacing={2}>
            {beneficios.map((item, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CheckCircleIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="body1">{item}</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>
    </MainLayout>
  );
}
