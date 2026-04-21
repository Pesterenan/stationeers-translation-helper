import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material";
import * as React from "react";
import { useTranslationContext } from "../context/TranslationContext";
import { useUIContext } from "../context/UIContext";

const FONT_OPTIONS = [
  { value: "font_english", label: "English (Latin Padrão)" },
  { value: "font_extended", label: "Extended (Latino com Acentos)" },
  { value: "font_russian", label: "Russian (Cirílico)" },
  { value: "font_cjk", label: "CJK (Chinês, Japonês, Coreano)" },
];

const DialogConfig = () => {
  const { activeDialog, closeDialog } = useUIContext();
  const { metadata, setMetadata, resetProject } = useTranslationContext();

  const [localMeta, setLocalMeta] = React.useState({
    Language: "",
    Code: "",
    Font: "",
    ExportFileName: "",
  });

  const isOpen = activeDialog === "CONFIG";

  React.useEffect(() => {
    if (isOpen && metadata) {
      setLocalMeta({
        Language: metadata.Language || "",
        Code: metadata.Code || "",
        Font: metadata.Font || "font_english",
        ExportFileName: metadata.ExportFileName || "",
      });
    }
  }, [isOpen, metadata]);

  const handleSave = () => {
    setMetadata(localMeta);
    closeDialog();
  };

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setLocalMeta(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleFontChange = (e: SelectChangeEvent<string>) => {
    setLocalMeta(prev => ({ ...prev, Font: e.target.value }));
  };

  return (
    <Dialog open={isOpen} onClose={closeDialog} fullWidth maxWidth="sm">
      <DialogTitle>Configurações do Projeto</DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Ajuste os metadados do arquivo XML e as configurações de exportação.
          </Typography>

          <TextField
            label="Nome do Idioma (Ex: Portuguese)"
            fullWidth
            value={localMeta.Language}
            onChange={handleChange("Language")}
            placeholder="Ex: Portuguese"
          />
          <TextField
            label="Código do Idioma (Ex: pt-BR)"
            fullWidth
            value={localMeta.Code}
            onChange={handleChange("Code")}
            placeholder="Ex: pt-BR"
          />
          
          <FormControl fullWidth>
            <InputLabel id="config-font-select-label">Fonte (Conjunto de Caracteres)</InputLabel>
            <Select
              labelId="config-font-select-label"
              value={localMeta.Font}
              label="Fonte (Conjunto de Caracteres)"
              onChange={handleFontChange}
            >
              {FONT_OPTIONS.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Nome do Arquivo Exportado (Ex: portuguese.xml)"
            fullWidth
            value={localMeta.ExportFileName}
            onChange={handleChange("ExportFileName")}
            helperText="Se vazio, usará o nome padrão baseado no idioma."
            placeholder="Ex: portuguese.xml"
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button 
          color="error" 
          onClick={() => { resetProject(); closeDialog(); }}
          sx={{ mr: "auto" }}
        >
          Resetar Projeto
        </Button>
        <Button onClick={closeDialog}>
          Cancelar
        </Button>
        <Button
          color="primary"
          onClick={handleSave}
          variant="contained"
        >
          Salvar Configurações
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DialogConfig;
