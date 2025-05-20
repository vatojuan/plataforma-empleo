// pages/soluciones/branding.js
import {
  Container,
  Typography,
  IconButton,
  Grid,
  Card,
  CardContent,
  Box,
  Button,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from "@mui/material";
import MainLayout from "../../components/MainLayout";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useRouter } from "next/router";

export default function Branding() {
  const router = useRouter();
  const handleArrowClick = () => router.push("/soluciones/outsourcing");
  const handleContact = () => router.push("/contacto");

  const servicios = [
    "Diagnóstico y desarrollo de estrategias de Employer Branding",
    "Comunicación interna y programas de reconocimiento",
    "Cultura organizacional y experiencia del empleado"
  ];

  const beneficios = [
    "Atracción de talento calificado",
    "Mayor compromiso y productividad",
    "Menor rotación de personal",
    "Mejor reputación empresarial"
  ];

  return (
    <MainLayout>
      {/* Hero */}
      <Box
        sx={{
          backgroundColor: "primary.main",
          color: "primary.contrastText",
          py: 6
        }}
      >
        <Container
          maxWidth="lg"
          sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
        >
          <Box>
            <Typography variant="h5">Employer Branding y Engagement</Typography>
            <Typography variant="h2" sx={{ fontWeight: "bold", mt: 1 }}>
              Construí tu marca empleadora
            </Typography>
          </Box>
          <IconButton onClick={handleArrowClick} sx={{ color: "primary.contrastText" }}>
            <ArrowForwardIosIcon fontSize="large" />
          </IconButton>
        </Container>
      </Box>

      {/* Contenido */}
      <Container maxWidth="lg" sx={{ py: 6 }}>
        {/* Descripción + CTA */}
        <Paper elevation={1} sx={{ p: 4, mb: 6 }}>
          <Typography variant="body1" paragraph>
            En FAP, ayudamos a las empresas a fortalecer su marca empleadora y potenciar el
            compromiso de sus empleados, creando un entorno de trabajo atractivo y motivador.
          </Typography>
          <Button variant="contained" size="large" onClick={handleContact}>
            Contáctanos
          </Button>
        </Paper>

        {/* ¿Por qué es importante? */}
        <Box sx={{ mb: 8 }}>
          <Typography variant="h4" gutterBottom>
            ¿Por qué es importante?
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon>
                <CheckCircleIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="Employer Branding: Construye y proyecta una imagen sólida como empleador para atraer y retener talento."
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CheckCircleIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="Employee Engagement: Fomenta el compromiso y la satisfacción de los empleados, impulsando la productividad y reduciendo la rotación."
              />
            </ListItem>
          </List>
        </Box>

        {/* Nuestros Servicios */}
        <Box sx={{ mb: 8 }}>
          <Typography variant="h4" gutterBottom>
            Nuestro servicio
          </Typography>
          <Grid container spacing={4}>
            {servicios.map((texto, i) => (
              <Grid item xs={12} md={4} key={i}>
                <Card elevation={2} sx={{ height: "100%" }}>
                  <CardContent>
                    <Typography variant="body1">{texto}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Beneficios */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom>
            Beneficios
          </Typography>
          <Grid container spacing={2}>
            {beneficios.map((item, i) => (
              <Grid item xs={12} md={6} key={i}>
                <Box sx={{ display: "flex", alignItems: "center" }}>
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
