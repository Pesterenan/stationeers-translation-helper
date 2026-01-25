import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Tooltip from "@mui/material/Tooltip";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import InputAdornment from "@mui/material/InputAdornment";
import Paper from "@mui/material/Paper";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";

type Props = {
  metadata: { Language?: string; Code?: string; Font?: string } | undefined;
  onUpdate: (upd: { Language?: string; Code?: string; Font?: string }) => void;
};

const FONT_OPTIONS = [
  { value: "font_english", label: "English (Latin Padrão)" },
  { value: "font_extended", label: "Extended (Latino com Acentos)" },
  { value: "font_russian", label: "Russian (Cirílico)" },
  { value: "font_cjk", label: "CJK (Chinês, Japonês, Coreano)" },
];

const MetadataCard: React.FC<Props> = ({ metadata, onUpdate }) => {
  const [local, setLocal] = useState<{ Language?: string; Code?: string; Font?: string }>(metadata ?? {});

  useEffect(() => {
    setLocal(metadata ?? {});
  }, [metadata]);

  const handleChange = (field: keyof typeof local, value: string) => {
    const next = { ...local, [field]: value };
    setLocal(next);
    // Para o Select, atualizamos o pai imediatamente para uma UX melhor
    if (field === "Font") {
      onUpdate(next);
    }
  };

  const handleBlur = () => {
    onUpdate(local);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleBlur();
    }
  };

  if (!metadata) return null;

  return (
    <Paper
      elevation={0}
      variant="outlined"
      sx={{
        p: 2,
        mb: 2,
        display: "flex",
        flexWrap: "wrap",
        gap: 2,
        alignItems: "center",
        bgcolor: "background.default",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", mr: 2 }}>
        <Typography variant="subtitle2" fontWeight="bold" color="text.secondary">
          CONFIGURAÇÃO DO IDIOMA
        </Typography>
      </Box>

      <TextField
        label="Nome (Language)"
        size="small"
        value={local.Language ?? ""}
        onChange={(e) => handleChange("Language", e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder="Ex: Português"
        sx={{ width: 200 }}
      />

      <TextField
        label="Código (Code)"
        size="small"
        value={local.Code ?? ""}
        onChange={(e) => handleChange("Code", e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder="Ex: PT-BR"
        sx={{ width: 120 }}
      />

      <FormControl size="small" sx={{ width: 240 }}>
        <InputLabel id="font-select-label">Fonte (Font)</InputLabel>
        <Select
          labelId="font-select-label"
          value={local.Font ?? "font_english"}
          label="Fonte (Font)"
          onChange={(e) => handleChange("Font", e.target.value)}
          onBlur={handleBlur}
          endAdornment={
            <InputAdornment position="end" sx={{ mr: 2 }}>
               <Tooltip title="Define o conjunto de caracteres suportado. Use 'font_extended' para Português se notar caracteres faltando.">
                  <InfoOutlinedIcon fontSize="small" color="action" style={{ cursor: 'help' }} />
                </Tooltip>
            </InputAdornment>
          }
        >
          {FONT_OPTIONS.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>
              {opt.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Typography variant="caption" color="text.secondary" sx={{ ml: "auto" }}>
        Dica: Use <b>font_extended</b> para garantir suporte a acentos (á, é, õ, ç).
      </Typography>
    </Paper>
  );
};

export default MetadataCard;
