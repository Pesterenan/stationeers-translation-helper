import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { createTheme, CssBaseline, ThemeProvider } from "@mui/material";
import { TranslationProvider } from "./context/TranslationProvider.tsx";
import { DialogProvider } from "./context/DialogProvider.tsx";
import { I18nProvider } from "./context/I18nProvider.tsx";

const theme = createTheme({
  palette: { mode: "dark" },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <I18nProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <TranslationProvider>
          <DialogProvider>
            <App />
          </DialogProvider>
        </TranslationProvider>
      </ThemeProvider>
    </I18nProvider>
  </StrictMode>,
);
