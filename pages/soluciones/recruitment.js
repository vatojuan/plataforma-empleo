// pages/soluciones/recruitment.js
import { Container, Typography, IconButton } from '@mui/material';
import MainLayout from '../../components/MainLayout';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { useRouter } from 'next/router';

export default function Recruitment() {
  const router = useRouter();
  
  const handleArrowClick = () => {
    router.push('/soluciones/capacitacion');
  };

  return (
    <MainLayout>
      {/* Encabezado con título a la izquierda y flecha a la derecha */}
      <Container 
        maxWidth="lg" 
        sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 2 }}
      >
        <Typography variant="h5" sx={{ color: '#000' }}>
          Recruitment Process
        </Typography>
        <IconButton onClick={handleArrowClick}>
          <ArrowForwardIosIcon fontSize="large" />
        </IconButton>
      </Container>

      <Container sx={{ mt: 4 }}>
        <Typography variant="h3" gutterBottom>
          Recruitment Process
        </Typography>
        <Typography variant="body1">
          Aquí se detallan las estrategias y pasos de nuestro proceso de reclutamiento para atraer y seleccionar el mejor talento.
        </Typography>
      </Container>
    </MainLayout>
  );
}
