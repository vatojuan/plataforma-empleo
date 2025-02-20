// components/DashboardLayout.js
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useTheme, styled } from "@mui/material/styles";
import { useSession } from "next-auth/react";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Drawer as MuiDrawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  IconButton
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PersonIcon from "@mui/icons-material/Person";
import PostAddIcon from "@mui/icons-material/PostAdd";
import ListAltIcon from "@mui/icons-material/ListAlt";
import WorkIcon from "@mui/icons-material/Work";
import SchoolIcon from "@mui/icons-material/School";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

const drawerWidth = 260;
const collapsedWidth = 72;

/* 
  1) Drawer abierto/cerrado con estilo "mini variant": 
     - Position: fixed para que no deje hueco.
     - Transiciones suaves de ancho.
*/
const openedMixin = (theme) => ({
  width: drawerWidth,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: "hidden",
});

const closedMixin = (theme) => ({
  width: collapsedWidth,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: "hidden",
});

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: theme.spacing(0, 1),
  // Alinea con la altura del AppBar
  ...theme.mixins.toolbar,
}));

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open, drawerbg }) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: "nowrap",
  position: "fixed",
  // Alto de la pantalla
  height: "100vh",
  "& .MuiDrawer-paper": {
    // Aplica el color de fondo recibido
    backgroundColor: drawerbg,
    color: "#fff",
    ...(open ? openedMixin(theme) : closedMixin(theme)),
  },
}));

/* 
  2) Contenedor principal con offset a la izquierda
     según el ancho del Drawer.
*/
const Main = styled("main", {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  flexGrow: 1,
  // Para que el contenido arranque justo después del Drawer
  marginLeft: open ? drawerWidth : collapsedWidth,
  transition: theme.transitions.create(["margin", "width"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  // Si quieres que la transición al cerrar sea la misma
  // puedes añadir un 'leavingScreen' para margin y width
  // en el else. Este es el valor "por defecto" que
  // asume MUI, pero puedes personalizarlo igual que openedMixin/closedMixin.
}));

export default function DashboardLayout({ children, toggleDarkMode, currentMode }) {
  const theme = useTheme();
  const { data: session, status } = useSession();
  const isDark = theme.palette.mode === "dark";

  const [userRole, setUserRole] = useState(null);

  // Lee y guarda el estado abierto/cerrado en localStorage
  const [open, setOpen] = useState(() => {
    if (typeof window !== "undefined") {
      const storedState = localStorage.getItem("sidebarOpen");
      return storedState ? JSON.parse(storedState) : true;
    }
    return true;
  });

  useEffect(() => {
    if (session?.user?.role) {
      setUserRole(session.user.role);
    }
  }, [session]);

  if (status === "loading" || !userRole) {
    return <p>Cargando...</p>;
  }

  const handleDrawerToggle = () => {
    setOpen((prev) => {
      const newState = !prev;
      if (typeof window !== "undefined") {
        localStorage.setItem("sidebarOpen", JSON.stringify(newState));
      }
      return newState;
    });
  };

  // Ajuste de colores para modo oscuro/claro
  const drawerBg = isDark ? "#4E342E" : theme.palette.primary.main;
  const appBarBg = isDark ? "#3E2723" : theme.palette.primary.dark;

  // Opciones de menú según el rol
  const menuItems = userRole === "empleador"
    ? [
        { text: "Inicio", icon: <DashboardIcon />, href: "/" },
        { text: "Publicar Oferta", icon: <PostAddIcon />, href: "/job-create" },
        { text: "Mis Ofertas", icon: <ListAltIcon />, href: "/job-list" },
        { text: "Actualizar Perfil", icon: <PersonIcon />, href: "/profile-empleador" },
      ]
    : [
        { text: "Inicio", icon: <DashboardIcon />, href: "/" },
        { text: "Ver Ofertas de Empleo", icon: <WorkIcon />, href: "/job-list" },
        { text: "Formación", icon: <SchoolIcon />, href: "/training" },
        { text: "Actualizar Perfil", icon: <PersonIcon />, href: "/profile-empleado" },
      ];

  return (
    <Box sx={{ display: "flex", backgroundColor: theme.palette.background.default }}>
      {/* Sidebar tipo "mini variant" fijo */}
      <Drawer variant="permanent" open={open} drawerbg={drawerBg}>
        <DrawerHeader>
          {open && (
            <Typography variant="h6" noWrap sx={{ pl: 1 }}>
              FAP Agency
            </Typography>
          )}
          <IconButton onClick={handleDrawerToggle} sx={{ color: "#fff" }}>
            {open ? <ChevronLeftIcon /> : <ChevronRightIcon />}
          </IconButton>
        </DrawerHeader>
        <Divider sx={{ bgcolor: "rgba(255,255,255,0.3)" }} />
        <List>
          {menuItems.map((item) => (
            <ListItem button component={Link} href={item.href} key={item.text}>
              <ListItemIcon sx={{ color: "#fff", minWidth: 0, mr: open ? 2 : "auto", justifyContent: "center" }}>
                {item.icon}
              </ListItemIcon>
              {open && (
                <ListItemText primary={item.text} primaryTypographyProps={{ color: "#fff" }} />
              )}
            </ListItem>
          ))}
        </List>
      </Drawer>

      {/* Área principal (AppBar + contenido) */} 
      <Main open={open}>
        <AppBar position="static" sx={{ backgroundColor: appBarBg }}>
          <Toolbar>
            {/* Se eliminó el título */}
            {toggleDarkMode && (
              <IconButton onClick={toggleDarkMode} color="inherit" sx={{ marginLeft: "auto" }}>
                {currentMode === "dark" ? <Brightness7Icon /> : <Brightness4Icon />}
              </IconButton>
            )}
          </Toolbar>
        </AppBar>
        <Box sx={{ p: 3, minHeight: "calc(100vh - 64px)" }}>
          {children}
        </Box>
      </Main>
    </Box>
  );
}
