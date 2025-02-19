// pages/_app.js
import { useState, useMemo, useEffect } from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { SessionProvider } from "next-auth/react";
import useMediaQuery from "@mui/material/useMediaQuery";

export default function App({ Component, pageProps: { session, ...pageProps } }) {
  // Detecta la preferencia del sistema para modo oscuro
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
  
  // Inicializa el modo según localStorage o la preferencia del sistema
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
            main: "#C97C5F", // Naranja/marrón pastel
            dark: "#9E5E47",
          },
          secondary: {
            main: "#FFAB91", // Naranja suave
          },
          // Nuevo color para textos y elementos (verde/teal oscuro)
          accent: {
            main: "#2F4F4F", 
          },
          background: {
            default: mode === "light" ? "#F4E4DB" : "#2B1B17",
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
