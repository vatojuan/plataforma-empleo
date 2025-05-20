// pages/soluciones/capacitacion.js
import {
  Container,
  Typography,
  IconButton,
  Box,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Button,
} from "@mui/material";
import MainLayout from "../../components/MainLayout";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useRouter } from "next/router";

export default function Capacitacion() {
  const router = useRouter();
  const handleNext = () => router.push("/soluciones/branding");
  const handleContact = () => router.push("/contacto");

  const areas = [
    "Cultura Organizacional Resiliente",
    "Comunicación Transformadora",
    "Tecnología y Competencias Digitales",
    "Liderazgo Consciente",
    "Gestión del Cambio Emocional",
    "Bienestar Integral y Mindfulness",
    "Nutrición en el Trabajo",
    "Marketing Digital",
    "Contabilidad Laboral",
  ];

  const beneficios = [
    "Desarrollo integral",
    "Mejora del rendimiento organizacional",
    "Adaptación al cambio",
    "Liderazgo efectivo",
    "Retención de talento",
  ];

  return (
    <MainLayout>
      {/* Hero */}
      <Box
        sx={{
          background:
            "linear-gradient(135deg,#0B2A2D 0%, #103B40 50%, #155158 100%)",
          color: "#FFF",
          py: { xs: 6, md: 8 },
        }}
      >
        <Container
          maxWidth="lg"
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box>
            <Typography variant="h5">Capacitación y Desarrollo</Typography>
            <Typography
              variant="h2"
              sx={{ fontWeight: 700, mt: 1, lineHeight: 1.2 }}
            >
              Programas que potencian<br />el crecimiento de tu equipo
            </Typography>
          </Box>
          <IconButton onClick={handleNext} sx={{ color: "#FFF" }}>
            <ArrowForwardIosIcon fontSize="large" />
          </IconButton>
        </Container>
      </Box>

      {/* Contenido principal */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        {/* Intro + CTA */}
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, md: 4 },
            mb: 8,
            backgroundColor: "rgba(16,59,64,0.85)",
            color: "#FFF",
          }}
        >
          <Typography variant="body1" paragraph>
            En FAP sabemos que el aprendizaje continuo es clave para el
            crecimiento empresarial y el fortalecimiento de la cultura
            organizacional. Nuestros programas de capacitación están diseñados
            para potenciar habilidades y alinear el desarrollo con los objetivos
            de tu empresa.
          </Typography>
          <Button variant="contained" size="large" onClick={handleContact}>
            Contáctanos
          </Button>
        </Paper>

        {/* Áreas de capacitación */}
        <Box sx={{ mb: 10 }}>
          <Typography variant="h4" gutterBottom>
            Áreas de capacitación
          </Typography>
          <Grid container spacing={4}>
            {areas.map((area, i) => (
              <Grid item xs={12} md={4} key={i}>
                <Card
                  elevation={3}
                  sx={{
                    height: "100%",
                    borderTop: "6px solid #D96236",
                    backgroundColor: "#12383C",
                    color: "#FFF",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <CardContent>
                    <Typography variant="body1">{area}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Metodología */}
        <Box sx={{ mb: 10 }}>
          <Typography variant="h4" gutterBottom>
            Metodología
          </Typography>
          <Typography variant="body1">
            Nuestros programas combinan clases teóricas, ejercicios prácticos y
            estudios de caso para garantizar un aprendizaje aplicado.
          </Typography>
        </Box>

        {/* Beneficios */}
        <Box sx={{ mb: 12 }}>
          <Typography variant="h4" gutterBottom>
            Beneficios
          </Typography>
          <Grid container spacing={2}>
            {beneficios.map((b, i) => (
              <Grid item xs={12} md={6} key={i}>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <CheckCircleIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {b}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* CTA final */}
        <Box
          sx={{
            textAlign: "center",
            backgroundColor: "#155158",
            py: 6,
            borderRadius: 2,
          }}
        >
          <Typography variant="h5" sx={{ mb: 2, color: "#FFF" }}>
            ¿Listo para impulsar el desarrollo de tu equipo?
          </Typography>
          <Button variant="contained" size="large" onClick={handleContact}>
            Hablemos
          </Button>
        </Box>
      </Container>
    </MainLayout>
  );
}
