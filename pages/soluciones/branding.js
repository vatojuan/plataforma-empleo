// pages/soluciones/branding.js
import { Container, Typography, IconButton } from '@mui/material';
import MainLayout from '../../components/MainLayout';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { useRouter } from 'next/router';

export default function Branding() {
  const router = useRouter();
  
  const handleArrowClick = () => {
    router.push('/soluciones/outsourcing');
  };

  return (
    <MainLayout>
      <Container 
        maxWidth="lg" 
        sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 2 }}
      >
        <Typography variant="h5" sx={{ color: '#000' }}>
          Employer Branding & Engagement
        </Typography>
        <IconButton onClick={handleArrowClick}>
          <ArrowForwardIosIcon fontSize="large" />
        </IconButton>
      </Container>

      <Container sx={{ mt: 4 }}>
        <Typography variant="h3" gutterBottom>
          Employer Branding & Engagement
        </Typography>
        <Typography variant="body1">
          Conoce nuestras estrategias para construir una marca empleadora sólida y fomentar el compromiso de tus equipos.
        </Typography>
      </Container>
    </MainLayout>
  );
}
