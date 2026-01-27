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
import { useRouter } from "next/router";

export default function LearningAndDevelopment() {
  const router = useRouter();
  const handleNext = () => router.push("/soluciones/branding");
  const handleContact = () => router.push("/contacto");

  const bloques = [
    {
      titulo: "Liderazgo y gestión de equipos",
      texto:
        "Desarrollá líderes capaces de inspirar, motivar y guiar a sus equipos hacia resultados sostenibles. Este programa promueve habilidades clave como la comunicación efectiva, la delegación, la toma de decisiones y la gestión emocional, fortaleciendo el liderazgo consciente y la cohesión grupal dentro de la organización.",
    },
    {
      titulo: "IA aplicada al trabajo real: tecnología, personas y cultura",
      texto:
        "Una capacitación práctica para comprender cómo la Inteligencia Artificial puede integrarse de manera efectiva en el trabajo cotidiano, potenciando la productividad, la toma de decisiones y la colaboración entre personas y tecnología. El enfoque pone en el uso responsable de la IA, el desarrollo de habilidades humanas clave y la adaptación cultural necesaria para acompañar la transformación digital en las organizaciones.",
    },
    {
      titulo: "Comunicación y habilidades humanas avanzadas",
      texto:
        "Potenciá las competencias interpersonales que marcan la diferencia en el entorno laboral actual. Este curso aborda la escucha activa, la empatía, la comunicación asertiva y la gestión emocional, claves para mejorar las relaciones laborales y fortalecer el trabajo en equipo.",
    },
    {
      titulo: "Cultura organizacional y lugar de trabajo atractivo",
      texto:
        "Impulsá una cultura interna sólida y coherente con los valores de tu empresa. Esta capacitación ayuda a construir entornos laborales más motivadores, inclusivos y sostenibles, mejorando la experiencia del empleado y el posicionamiento como empleador atractivo.",
    },
    {
      titulo: "Nutrición en el trabajo: alimentación consciente para el bienestar laboral",
      texto:
        "Promové el bienestar y la productividad de tu equipo a través de hábitos alimentarios saludables. Este espacio combina conceptos de nutrición práctica y bienestar integral, ayudando a los colaboradores a mantener energía, concentración y equilibrio durante la jornada laboral.",
    },
  ];

  return (
    <MainLayout>
      {/* HERO */}
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
            <Typography variant="h5">Capacitaciones para tu equipo</Typography>
            <Typography
              variant="h2"
              sx={{ fontWeight: 700, mt: 1, lineHeight: 1.2 }}
            >
              Formación que transforma
              <br />
              personas y organizaciones
            </Typography>
          </Box>
          <IconButton onClick={handleNext} sx={{ color: "#FFF" }}>
            <ArrowForwardIosIcon fontSize="large" />
          </IconButton>
        </Container>
      </Box>

      {/* INTRO + CTA */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
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
            En FAP diseñamos experiencias de aprendizaje que impulsan el cambio
            real. Formamos equipos preparados para afrontar los desafíos
            actuales y futuros, abordando bienestar, innovación y propósito
            compartido.
          </Typography>
          <Button variant="contained" size="large" onClick={handleContact}>
            Contáctanos
          </Button>
        </Paper>

        {/* BLOQUES */}
        <Box sx={{ mb: 10 }}>
          <Typography variant="h4" gutterBottom>
            Soluciones para potenciar a tu equipo
          </Typography>
          <Grid container spacing={4}>
            {bloques.map((b, i) => (
              <Grid item xs={12} md={6} key={i}>
                <Card
                  elevation={3}
                  sx={{
                    height: "100%",
                    borderTop: "6px solid #D96236",
                    backgroundColor: "#12383C",
                    color: "#FFF",
                  }}
                >
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {b.titulo}
                    </Typography>
                    {/* Se eliminó la sección de subtítulo ya que los nuevos datos no la utilizan */}
                    <Typography variant="body2">{b.texto}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* CTA FINAL */}
        <Box
          sx={{
            textAlign: "center",
            backgroundColor: "#155158",
            py: 6,
            borderRadius: 2,
          }}
        >
          <Typography variant="h5" sx={{ mb: 2, color: "#FFF" }}>
            ¿Buscás capacitar a tu equipo o impulsar tu solución digital?
          </Typography>
          <Button variant="contained" size="large" onClick={handleContact}>
            Hablemos
          </Button>
        </Box>
      </Container>
    </MainLayout>
  );
}