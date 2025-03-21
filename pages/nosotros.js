// pages/nosotros.js
import { Box, Container, Typography } from "@mui/material";

export default function Nosotros() {
  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        minHeight: "100vh",
        bgcolor: "#fff", // fondo blanco, igual que el PDF
        py: 6,
        px: { xs: 2, md: 4 },
      }}
    >
      {/* Logo FAP en la esquina superior derecha */}
      <Box sx={{ position: "absolute", top: 16, right: 16 }}>
        <img
          src="/images/fap-logo.png"
          alt="FAP Logo"
          style={{ maxWidth: 150, width: "100%" }}
        />
      </Box>

      <Container maxWidth="md">
        {/* Título superior */}
        <Typography
          variant="h6"
          align="center"
          sx={{
            fontFamily: "'Bodoni Moda', serif",
            color: "#C97C5F", // color primario del sitio
            mb: 1,
          }}
        >
          Naranja Negocios Servicios Sitio Web
        </Typography>

        <Typography
          variant="h3"
          align="center"
          sx={{
            fontFamily: "'Bodoni Moda', serif",
            mb: 4,
          }}
        >
          Nosotros
        </Typography>

        {/* Texto principal */}
        <Typography
          variant="body1"
          align="justify"
          sx={{
            fontFamily: "'Bodoni Moda', serif",
            fontSize: "1.2rem",
            mb: 4,
            lineHeight: 1.6,
          }}
        >
          En FAP Consultora, nos especializamos en la gestión de recursos humanos,
          brindando soluciones personalizadas que potencian el talento y optimizan
          el rendimiento organizacional. Trabajamos con un enfoque confiable,
          flexible y colaborativo, promoviendo relaciones laborales basadas en la
          transparencia y la empatía.
        </Typography>

        {/* Sección: Misión y Objetivo */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h4"
            sx={{
              fontFamily: "'Bodoni Moda', serif",
              mb: 2,
            }}
          >
            Misión y objetivo
          </Typography>
          <Typography
            variant="body1"
            align="justify"
            sx={{
              fontFamily: "'Bodoni Moda', serif",
              fontSize: "1.2rem",
              lineHeight: 1.6,
            }}
          >
            Colaborar con empresas para mejorar la gestión de sus recursos humanos,
            ofreciendo estrategias a medida que impulsen un ambiente de trabajo
            motivador y productivo.
            <br />
            <br />
            Optimizar la gestión del capital humano para mejorar el rendimiento
            organizacional y el bienestar de los empleados, generando entornos
            laborales más eficientes y armoniosos.
          </Typography>
        </Box>

        {/* Sección: Visión y Valores */}
        <Box>
          <Typography
            variant="h4"
            sx={{
              fontFamily: "'Bodoni Moda', serif",
              mb: 2,
            }}
          >
            Visión y valores
          </Typography>
          <Typography
            variant="body1"
            align="justify"
            sx={{
              fontFamily: "'Bodoni Moda', serif",
              fontSize: "1.2rem",
              lineHeight: 1.6,
            }}
          >
            Ser la consultora de referencia en Valle de Uco y Mendoza, reconocida por
            nuestra excelencia, experiencia y capacidad para contribuir al crecimiento
            profesional y personal de individuos y organizaciones.
            <br />
            <br />
            Nos guiamos por la solidaridad, la fidelidad y la unión, comprometiéndonos
            con el bienestar de las personas y el éxito de cada empresa con la que
            trabajamos.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
