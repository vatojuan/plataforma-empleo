// pages/soluciones/outsourcing.js
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

export default function Outsourcing() {
  const router = useRouter();
  const handleNext = () => router.push("/contacto");
  const handleContact = () => router.push("/contacto");

  const servicios = [
    {
      titulo: "Payroll Specialist",
      descripcion:
        "Gestión integral de nóminas: cálculos, beneficios, retenciones, reportes y control de ausencias.",
    },
    {
      titulo: "Community Manager",
      descripcion:
        "Gestión de redes sociales: estrategia, contenido visual y escrito, atención a la comunidad y campañas.",
    },
    {
      titulo: "Psicología y Desarrollo Organizacional",
      descripcion:
        "Programas de bienestar, prevención de agotamiento, liderazgo consciente y productividad basada en neurociencia.",
    },
    {
      titulo: "Catering Corporativo",
      descripcion:
        "Servicios de catering para eventos, menús personalizados, snacks, bebidas y montaje in-situ.",
    },
  ];

  const beneficios = [
    "Enfoque en el core de tu negocio",
    "Expertos especializados sin sobrecargar tu staff",
    "Eficiencia operativa y ahorro de costos",
    "Flexibilidad y escalabilidad del servicio",
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
          sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
        >
          <Box>
            <Typography variant="h5">Outsourcing</Typography>
            <Typography
              variant="h2"
              sx={{ fontWeight: 700, mt: 1, lineHeight: 1.2 }}
            >
              Expertos externos<br />para tu eficiencia
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
            Entendemos que las empresas necesitan expertos en áreas clave para
            maximizar su eficiencia operativa sin sobrecargar a sus equipos
            internos. Con nuestros servicios de outsourcing tu organización se
            enfoca en lo que mejor hace, mientras nosotros nos encargamos de
            tareas especializadas.
          </Typography>
          <Button variant="contained" size="large" onClick={handleContact}>
            Contáctanos
          </Button>
        </Paper>

        {/* Nuestros servicios */}
        <Box sx={{ mb: 10 }}>
          <Typography variant="h4" gutterBottom>
            Nuestros servicios
          </Typography>
          <Grid container spacing={4}>
            {servicios.map((s, i) => (
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
                      {s.titulo}
                    </Typography>
                    <Typography variant="body2">{s.descripcion}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
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
            ¿Listo para delegar y crecer?
          </Typography>
          <Button variant="contained" size="large" onClick={handleContact}>
            Hablemos
          </Button>
        </Box>
      </Container>
    </MainLayout>
  );
}
