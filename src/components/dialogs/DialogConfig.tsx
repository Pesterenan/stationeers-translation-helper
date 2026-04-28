import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material";
import * as React from "react";
import { locales } from "../../locales";
import type { TLocaleKey } from "../../locales";
import { useDialogContext } from "../../context/useDialogContext";
import { useI18nContext } from "../../context/useI18nContext";
import { useTranslationContext } from "../../context/useTranslationContext";

const FONT_OPTIONS = [
  { value: "font_english", label: "English (Latin Padrão)" },
  { value: "font_extended", label: "Extended (Latino com Acentos)" },
  { value: "font_russian", label: "Russian (Cirílico)" },
  { value: "font_cjk", label: "CJK (Chinês, Japonês, Coreano)" },
];

const DialogConfig = () => {
  const { activeDialog, closeDialog } = useDialogContext();
  const { metadata, setMetadata, resetProject } = useTranslationContext();
  const { t, locale, changeLanguage } = useI18nContext();

  const [localMeta, setLocalMeta] = React.useState({
    Language: "",
    Code: "",
    Font: "",
    ExportFileName: "",
    OriginalFileName: "",
  });

  const isOpen = activeDialog === "CONFIG";

  React.useEffect(() => {
    if (isOpen && metadata) {
      setLocalMeta({
        Language: metadata.Language || "",
        Code: metadata.Code || "",
        Font: metadata.Font || "font_english",
        ExportFileName: metadata.ExportFileName || "",
        OriginalFileName: metadata.OriginalFileName || "",
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
      <DialogTitle>{t('dialogConfig.title')}</DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            {t('dialogConfig.description')}
          </Typography>

          <Grid container gap={2}>
            <Grid size="grow">
              <FormControl fullWidth>
                <InputLabel id="config-ui-lang-select-label">{t('dialogConfig.uiLanguageLabel')}</InputLabel>
                <Select
                  
                  labelId="config-ui-lang-select-label"
                  value={locale}
                  label={t('dialogConfig.uiLanguageLabel')}
                  onChange={(e) => changeLanguage(e.target.value as TLocaleKey)}
                  size="small"
                >
                  {Object.entries(locales).map(([key, dict]) => (
                    <MenuItem key={key} value={key}>
                      {(dict).label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid size="grow">
              <TextField
                fullWidth
                label={t('dialogConfig.exportFileLabel')}
                value={localMeta.ExportFileName}
                onChange={handleChange("ExportFileName")}
                helperText={t('dialogConfig.exportFileHelper')}
                placeholder="Ex: portuguese-brazilian.xml"
                size="small"
              />
            </Grid>
          </Grid>

          <Typography variant="body2" color="text.secondary">
            {t('dialogConfig.filePropertiesDescription')}
          </Typography>

          <Grid container gap={2}>
            <Grid size="grow">
              <TextField
                fullWidth
                label={t('dialogConfig.languageLabel')}
                value={localMeta.Language}
                onChange={handleChange("Language")}
                placeholder="Ex: Portuguese"
                size="small"
              />
            </Grid>
            <Grid size="grow">
              <TextField
                fullWidth
                label={t('dialogConfig.codeLabel')}
                value={localMeta.Code}
                onChange={handleChange("Code")}
                placeholder="Ex: PB"
                size="small"
              />
            </Grid>
          </Grid>

          <FormControl fullWidth>
            <InputLabel id="config-font-select-label">{t('dialogConfig.fontLabel')}</InputLabel>
            <Select
              labelId="config-font-select-label"
              value={localMeta.Font}
              label={t('dialogConfig.fontLabel')}
              onChange={handleFontChange}
              size="small"
            >
              {FONT_OPTIONS.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label={t('dialogConfig.originalFileLabel')}
            fullWidth
            value={localMeta.OriginalFileName}
            disabled
            slotProps={{ input: { readOnly: true } }}
            size="small"
            helperText={t('dialogConfig.originalFileHelper')}
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button
          color="error"
          onClick={() => { resetProject(); closeDialog(); }}
          sx={{ mr: "auto" }}
        >
          {t('dialogConfig.resetProject')}
        </Button>
        <Button onClick={closeDialog}>
          {t('dialogConfig.cancel')}
        </Button>
        <Button
          color="primary"
          onClick={handleSave}
          variant="contained"
        >
          {t('dialogConfig.save')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DialogConfig;
