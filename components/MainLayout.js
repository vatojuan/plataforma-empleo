// components/MainLayout.js
import { Box, AppBar, Toolbar, Button, IconButton, SvgIcon, Fab } from '@mui/material';
import Link from 'next/link';
import Footer from './Footer';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import LinkedInIcon from '@mui/icons-material/LinkedIn';

// Componente para el ícono de Instagram personalizado
function InstagramIcon(props) {
  return (
    <SvgIcon {...props}>
      <path d="M7.5 2C4.46243 2 2 4.46243 2 7.5V16.5C2 19.5376 4.46243 22 7.5 22H16.5C19.5376 22 22 19.5376 22 16.5V7.5C22 4.46243 19.5376 2 16.5 2H7.5ZM12 7C14.2091 7 16 8.79086 16 11C16 13.2091 14.2091 15 12 15C9.79086 15 8 13.2091 8 11C8 8.79086 9.79086 7 12 7ZM18 6.5C18 7.32843 17.3284 8 16.5 8C15.6716 8 15 7.32843 15 6.5C15 5.67157 15.6716 5 16.5 5C17.3284 5 18 5.67157 18 6.5Z" />
    </SvgIcon>
  );
}

export default function MainLayout({ children }) {
  return (
    <Box sx={{ position: 'relative', minHeight: '100vh', overflow: 'hidden' }}>
      {/* AppBar persistente */}
      <AppBar position="static" sx={{ backgroundColor: 'transparent', boxShadow: 'none', mb: 4 }}>
        <Toolbar sx={{ flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'center' }}>
          <Button component={Link} href="/nosotros" color="inherit">
            Nosotros
          </Button>
          <Button component={Link} href="/soluciones" color="inherit">
            Soluciones
          </Button>
          <Button component={Link} href="/contacto" color="inherit">
            Contacto
          </Button>
          <Button
            variant="outlined"
            color="inherit"
            sx={{ ml: 2 }}
            onClick={() => window.location.href = "https://fapmendoza.online/cv/upload"}
          >
            Subir CV
          </Button>
          {/* Puedes agregar botones de sesión aquí según corresponda */}
          <Box sx={{ ml: 'auto', display: 'flex' }}>
            <IconButton onClick={() => window.open("https://www.instagram.com/faprrhh", "_blank")} color="inherit">
              <InstagramIcon />
            </IconButton>
            <IconButton onClick={() => window.open("https://www.linkedin.com/in/florenciaalvarezfap", "_blank")} color="inherit">
              <LinkedInIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Contenido principal: se inyecta el children */}
      <Box sx={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 64px)' }}>
        {children}
        <Box sx={{ flexGrow: 1 }} />
        <Footer />
      </Box>

      {/* Botón flotante de WhatsApp */}
      <Box sx={{ position: 'fixed', bottom: 16, right: 16, zIndex: 2 }}>
        <Fab color="success" aria-label="WhatsApp" onClick={() => window.open("http://api.whatsapp.com/send?phone=542622542125&text=Me+interesa+el+Servicio+de+Recursos+Humanos", "_blank")}>
          <WhatsAppIcon />
        </Fab>
      </Box>
    </Box>
  );
}
