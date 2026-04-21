import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { createTheme, CssBaseline, ThemeProvider } from "@mui/material";
import { TranslationProvider } from "./context/TranslationContext.tsx";
import { UIProvider } from "./context/UIContext.tsx";
import { I18nProvider } from "./context/I18nContext.tsx";

const theme = createTheme({
  palette: { mode: "dark" },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <I18nProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <TranslationProvider>
          <UIProvider>
            <App />
          </UIProvider>
        </TranslationProvider>
      </ThemeProvider>
    </I18nProvider>
  </StrictMode>,
);
