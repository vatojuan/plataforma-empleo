// components/DashboardLayout.js
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useTheme } from "@mui/material/styles";
import { useSession } from "next-auth/react";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Drawer,
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

export default function DashboardLayout({ children, toggleDarkMode, currentMode }) {
  const theme = useTheme();
  const { data: session, status } = useSession();
  const isDark = theme.palette.mode === "dark";
  const [open, setOpen] = useState(true);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    if (session?.user?.role) {
      setUserRole(session.user.role); // Actualizar userRole cada vez que la sesión cambie
    }
  }, [session]);

  if (status === "loading" || !userRole) {
    return <p>Cargando...</p>;
  }

  const handleDrawerToggle = () => {
    setOpen((prev) => !prev);
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
        { text: "Actualizar Perfil", icon: <PersonIcon />, href: "/profile-empleador" }
      ]
    : [
        { text: "Inicio", icon: <DashboardIcon />, href: "/" },
        { text: "Ver Ofertas de Empleo", icon: <WorkIcon />, href: "/job-list" },
        { text: "Formación", icon: <SchoolIcon />, href: "/training" },
        { text: "Actualizar Perfil", icon: <PersonIcon />, href: "/profile-empleado" }
      ];

  return (
    <Box sx={{ display: "flex" }}>
      {/* Sidebar Colapsable */}
      <Drawer
        variant="permanent"
        sx={{
          width: open ? drawerWidth : collapsedWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: open ? drawerWidth : collapsedWidth,
            boxSizing: "border-box",
            backgroundColor: drawerBg,
            color: "#fff",
            overflowX: "hidden",
            transition: theme.transitions.create("width", {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
          },
        }}
      >
        <Toolbar sx={{ justifyContent: open ? "space-between" : "center", px: 2 }}>
          {open && (
            <Typography variant="h6" noWrap>
              FAP Agency
            </Typography>
          )}
          <IconButton onClick={handleDrawerToggle} sx={{ color: "#fff" }}>
            {open ? <ChevronLeftIcon /> : <ChevronRightIcon />}
          </IconButton>
        </Toolbar>
        <Divider sx={{ bgcolor: "rgba(255,255,255,0.3)", width: "100%" }} />
        <List sx={{ width: "100%" }}>
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

      {/* Área principal: Header y contenido */}
      <Box sx={{ flexGrow: 1, ml: open ? `${drawerWidth}px` : `${collapsedWidth}px` }}>
        <AppBar position="static" sx={{ backgroundColor: appBarBg }}>
          <Toolbar>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              FAP Agency
            </Typography>
            {toggleDarkMode && (
              <IconButton onClick={toggleDarkMode} color="inherit">
                {currentMode === "dark" ? <Brightness7Icon /> : <Brightness4Icon />}
              </IconButton>
            )}
          </Toolbar>
        </AppBar>
        <Box sx={{ p: 3, backgroundColor: theme.palette.background.default, minHeight: "calc(100vh - 64px)" }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}
