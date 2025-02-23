import { useState, useMemo, useEffect } from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { SessionProvider } from "next-auth/react";
import useMediaQuery from "@mui/material/useMediaQuery";

export default function App({ Component, pageProps: { session, ...pageProps } }) {
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
  const [mode, setMode] = useState("light");

  useEffect(() => {
    const storedMode = localStorage.getItem("colorMode");
    if (storedMode) {
      setMode(storedMode);
    } else {
      setMode(prefersDarkMode ? "dark" : "light");
    }
  }, [prefersDarkMode]);

  const toggleDarkMode = () => {
    setMode((prevMode) => {
      const newMode = prevMode === "light" ? "dark" : "light";
      localStorage.setItem("colorMode", newMode);
      return newMode;
    });
  };

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: {
            main: "#D96236", // Nuevo color primario
            dark: "#B0482B", // Tono oscuro derivado (se puede ajustar)
          },
          secondary: {
            main: "#103B40", // Nuevo color secundario
          },
          accent: {
            main: "#2F4F4F", // Si deseas mantener este color o actualizarlo
          },
          background: {
            default: mode === "light" ? "#F2E6CE" : "#2B1B17", // Fondo claro con el nuevo tono
            paper: mode === "light" ? "#FFFFFF" : "#3E2723",
          },
          text: {
            primary: mode === "light" ? "#3E2723" : "#FAD9CF",
            secondary: mode === "light" ? "#5D4037" : "#D7CCC8",
            accent: "#2F4F4F",
          },
        },
        typography: {
          fontFamily: "'Bodoni Moda', serif",
          h1: {
            fontWeight: 700,
            fontSize: "2.4rem",
          },
          h2: {
            fontWeight: 600,
            fontSize: "2rem",
          },
          h6: {
            fontWeight: 500,
          },
          body1: {
            fontSize: "1rem",
            lineHeight: 1.6,
          },
        },
      }),
    [mode]
  );

  return (
    <SessionProvider session={session}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Component {...pageProps} toggleDarkMode={toggleDarkMode} currentMode={mode} />
      </ThemeProvider>
    </SessionProvider>
  );
}
