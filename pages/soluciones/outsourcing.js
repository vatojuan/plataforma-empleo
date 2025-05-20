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
  Divider,
} from "@mui/material";
import MainLayout from "../../components/MainLayout";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useRouter } from "next/router";

export default function Outsourcing() {
  const router = useRouter();
  const handleNext = () => router.push("/contacto");
  const handleContact = () => router.push("/contacto");

  /* Servicios con detalle completo */
  const servicios = [
    {
      titulo: "Payroll Specialist (Responsable de Nóminas)",
      resumen:
        "Gestión integral y conforme a normativas para asegurar procesos precisos y oportunos.",
      bullets: [
        "Elaboración de nóminas y pagos",
        "Cálculo y gestión de beneficios laborales",
        "Asesoría en retenciones fiscales y seguridad social",
        "Reportes de pagos y deducciones",
        "Gestión de vacaciones, licencias y ausencias",
      ],
    },
    {
      titulo: "Community Manager",
      resumen:
        "Construye una comunidad digital activa y comprometida alrededor de tu marca.",
      bullets: [
        "Creación y ejecución de estrategias de redes sociales",
        "Desarrollo de contenido visual y escrito (imágenes, videos, textos)",
        "Gestión de la comunidad y atención a usuarios",
        "Gestión de campañas publicitarias",
      ],
    },
    {
      titulo: "Psicología y Desarrollo Organizacional",
      resumen:
        "Programas de bienestar y desarrollo para un ambiente de trabajo saludable y productivo.",
      bullets: [
        "Prevención de agotamiento laboral y equilibrio emocional",
        "Estrategias basadas en neurociencia para maximizar productividad",
        "Implementación de programas de bienestar y salud mental",
        "Liderazgo consciente para mejores decisiones",
        "Programas de integración de equipos y liderazgo",
      ],
    },
    {
      titulo: "Catering Corporativo",
      resumen:
        "Soluciones gastronómicas adaptadas a eventos, reuniones y capacitaciones.",
      bullets: [
        "Catering para eventos corporativos y reuniones",
        "Menús saludables y personalizados",
        "Provisión de bebidas y snacks",
        "Servicios de entrega y montaje in-situ",
      ],
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
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
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
            Entendemos que las empresas necesitan contar con expertos en áreas
            clave para maximizar su eficiencia operativa sin sobrecargar a sus
            equipos internos. Por eso, ofrecemos servicios de outsourcing
            personalizados que permiten a tu organización enfocarse en lo que
            mejor hace, mientras nosotros nos encargamos de tareas
            especializadas.
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
                    <Typography variant="body2" sx={{ mb: 1.5 }}>
                      {s.resumen}
                    </Typography>
                    <Divider sx={{ mb: 1, backgroundColor: "rgba(255,255,255,0.2)" }} />
                    <List dense>
                      {s.bullets.map((b, idx) => (
                        <ListItem key={idx} sx={{ pl: 0 }}>
                          <ListItemIcon sx={{ minWidth: 28 }}>
                            <CheckCircleIcon color="primary" fontSize="small" />
                          </ListItemIcon>
                          <ListItemText primary={b} />
                        </ListItem>
                      ))}
                    </List>
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
