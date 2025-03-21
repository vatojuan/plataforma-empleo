// pages/soluciones/capacitacion.js
import { Container, Typography, IconButton } from '@mui/material';
import MainLayout from '../../components/MainLayout';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { useRouter } from 'next/router';

export default function Capacitacion() {
  const router = useRouter();
  
  const handleArrowClick = () => {
    router.push('/soluciones/branding');
  };

  return (
    <MainLayout>
      <Container 
        maxWidth="lg" 
        sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 2 }}
      >
        <Typography variant="h5" sx={{ color: '#000' }}>
          Capacitación y Desarrollo
        </Typography>
        <IconButton onClick={handleArrowClick}>
          <ArrowForwardIosIcon fontSize="large" />
        </IconButton>
      </Container>

      <Container sx={{ mt: 4 }}>
        <Typography variant="h3" gutterBottom>
          Capacitación y Desarrollo
        </Typography>
        <Typography variant="body1">
          Descubre nuestros programas de formación diseñados para potenciar el desarrollo profesional y personal de tus colaboradores.
        </Typography>
      </Container>
    </MainLayout>
  );
}
