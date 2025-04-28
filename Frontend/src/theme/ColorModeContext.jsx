import { createContext, useMemo, useState } from "react";
import { createTheme, ThemeProvider } from "@mui/material/styles";

import bannerLight from "../assets/banner.png";
import bannerDark from "../assets/banner_black.png";

export const ColorModeContext = createContext({ toggleColorMode: () => {} });

export const CustomThemeProvider = ({ children }) => {
  const [mode, setMode] = useState("light");

  const colorMode = useMemo(() => ({
    toggleColorMode: () => {
      setMode((prevMode) => (prevMode === "light" ? "dark" : "light"));
    },
  }), []);

  const theme = useMemo(() => {
    return createTheme({
      palette: {
        mode,
        ...(mode === "light"
          ? {
              primary: {
                main: "#1976d2", // blue for light
              },
              background: {
                default: `linear-gradient(90deg, rgba(205,252,241,0.9) 0%, rgba(241,254,251,1) 16%, rgba(248,254,253,1) 49%, rgba(241,254,251,1) 84%, rgba(205,252,241,1) 100%)`,
                paper: "#ffffff",
                footer: "#7C7777"
              },
              text: {
                primary: "#000000",
              },
              banner: {
                src: bannerLight,
                background: 'linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(255,255,255,0.9) 100%)'

              }, 
              header : {
                background: "#FF5050",
                
              },
              backgroundGradient: 'linear-gradient(90deg, rgba(195, 253, 239, 0.9) 0%, rgba(241,254,251,1) 16%, rgb(253, 253, 253) 49%, rgba(241,254,251,1) 84%, rgba(195, 253, 239, 0.9) 100%)',  

            }
          : {
              primary: {
                main: "#90caf9", // soft blue for dark
              },
              background: {
                default: "rgb(61, 61, 61)", // dark background
                paper: "#1e1e1e",   // cards, appbar
                footer: "#1e1e1e",
              },
              text: {
                primary: "#ffffff",
              },
              banner: {
                src: bannerDark,
                background: 'linear-gradient(to right, rgba(174, 173, 173, 0.2) 0%, rgba(61, 61, 61, 0.8) 100%)'
              },
              header : {
                background: '#be3939',
              },
              backgroundGradient: 'linear-gradient( 90deg, rgba(100, 100, 100, 1) 0%, rgba(80, 80, 80, 0.95) 20%, rgba(61, 61, 61, 0.9) 50%, rgba(80, 80, 80, 0.95) 80%, rgba(100, 100, 100, 1) 100%)',  
            }),
      },
    });
  }, [mode]);

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </ColorModeContext.Provider>
  );
};
