// pages/soluciones/learning_and_development.js
import {
  Container,
  Typography,
  IconButton,
  Box,
  Grid,
  Card,
  CardContent,
  Paper,
  Button,
} from "@mui/material";
import MainLayout from "../../components/MainLayout";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useRouter } from "next/router";

export default function LearningAndDevelopment() {
  const router = useRouter();
  const handleNext = () => router.push("/soluciones/branding");
  const handleContact = () => router.push("/contacto");

  const capacitaciones = [
    "Cultura Organizacional Resiliente",
    "Comunicación Transformadora",
    "Tecnología y Competencias Digitales",
    "Liderar para conectar: Equipos que transforman",
    "Desarrollo de Capacidades para el Alto Desempeño",
    "Bienestar Integral y Mindfulness",
    "Nutrición en el Trabajo",
    "Coaching y Mentoring Empresarial",
    "Arte de generar Ambientes Laborales Saludables y Atractivos",
  ];

  const desarrolloSoftware = [
    "Análisis de requerimientos y diseño de soluciones personalizadas",
    "Desarrollo de aplicaciones móviles, web o de escritorio",
    "Integración de sistemas y plataformas",
    "Mantenimiento, soporte y actualizaciones continuas",
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
            <Typography variant="h5">Learning and Development</Typography>
            <Typography
              variant="h2"
              sx={{ fontWeight: 700, mt: 1, lineHeight: 1.2 }}
            >
              Formación que transforma<br />personas y organizaciones
            </Typography>
          </Box>
          <IconButton onClick={handleNext} sx={{ color: "#FFF" }}>
            <ArrowForwardIosIcon fontSize="large" />
          </IconButton>
        </Container>
      </Box>

      {/* Contenido */}
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
            En FAP diseñamos experiencias de aprendizaje que impulsan el cambio real.
            Formamos equipos preparados para afrontar los desafíos actuales y futuros
            desde el bienestar, la innovación y el propósito compartido.
          </Typography>
          <Button variant="contained" size="large" onClick={handleContact}>
            Contáctanos
          </Button>
        </Paper>

        {/* Capacitaciones */}
        <Box sx={{ mb: 10 }}>
          <Typography variant="h4" gutterBottom>
            Capacitaciones pensadas para transformar
          </Typography>
          <Grid container spacing={4}>
            {capacitaciones.map((item, i) => (
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
                    <Typography variant="body1">{item}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Desarrollo de software */}
        <Box sx={{ mb: 12 }}>
          <Typography variant="h4" gutterBottom>
            Desarrollo de Software
          </Typography>
          <Typography variant="body1" paragraph>
            Creamos soluciones tecnológicas a medida que impulsan el crecimiento y la eficiencia de tu empresa.
          </Typography>
          <Grid container spacing={2}>
            {desarrolloSoftware.map((linea, i) => (
              <Grid item xs={12} md={6} key={i}>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <CheckCircleIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="body1">{linea}</Typography>
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
            ¿Querés capacitar a tu equipo o impulsar tu solución digital?
          </Typography>
          <Button variant="contained" size="large" onClick={handleContact}>
            Hablemos
          </Button>
        </Box>
      </Container>
    </MainLayout>
  );
}
