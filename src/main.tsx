import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { createTheme, CssBaseline, ThemeProvider } from "@mui/material";
import { TranslationProvider } from "./context/TranslationContext.tsx";

const theme = createTheme({
  palette: { mode: "dark" },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <TranslationProvider>
        <App />
      </TranslationProvider>
    </ThemeProvider>
  </StrictMode>,
);
