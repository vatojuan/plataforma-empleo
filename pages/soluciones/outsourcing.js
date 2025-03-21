// pages/soluciones/outsourcing.js
import { Container, Typography, IconButton } from '@mui/material';
import MainLayout from '../../components/MainLayout';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { useRouter } from 'next/router';

export default function Outsourcing() {
  const router = useRouter();
  
  const handleArrowClick = () => {
    router.push('/contacto');
  };

  return (
    <MainLayout>
      <Container 
        maxWidth="lg" 
        sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 2 }}
      >
        <Typography variant="h5" sx={{ color: '#000' }}>
          Outsourcing
        </Typography>
        <IconButton onClick={handleArrowClick}>
          <ArrowForwardIosIcon fontSize="large" />
        </IconButton>
      </Container>

      <Container sx={{ mt: 4 }}>
        <Typography variant="h3" gutterBottom>
          Outsourcing
        </Typography>
        <Typography variant="body1">
          Te mostramos cómo podemos externalizar procesos de recursos humanos de manera eficiente y rentable para tu empresa.
        </Typography>
      </Container>
    </MainLayout>
  );
}
