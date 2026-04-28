import React, { type ChangeEvent } from "react";
import Button from "@mui/material/Button";
import { readFileAsText } from "../lib/fileHelpers";
import { useI18nContext } from "../context/useI18nContext";
import { useDialogContext } from "../context/useDialogContext";

type Props = {
  onXml: (fileText: string, fileName?: string, version?: string) => void;
  onProgressJson: (jsonText: string) => void;
  onStart?: () => void;
};

const FileImporter: React.FC<Props> = ({ onXml, onProgressJson, onStart }) => {
  const { t } = useI18nContext();
  const { showAlert } = useDialogContext();

  const handleFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    onStart?.();
    await new Promise(resolve => setTimeout(resolve, 50));

    const text = await readFileAsText(file);
    const name = file.name.toLowerCase();

    // Validação de prefixo: apenas arquivos que começam com 'english' são permitidos
    if (!name.startsWith('english')) {
      await showAlert(t('app.title'), t('importer.errorPrefix'));
      e.target.value = "";
      return;
    }

    const isJson = name.endsWith('.json') || name.endsWith('.progress') || file.type === 'application/json';
    const isXml = name.endsWith('.xml') || file.type === 'text/xml';
    if (isJson) {
      onProgressJson(text)
    } else if (isXml) {
      onXml(text, file.name, file.lastModified.toString())
    } else {
      // fallback: tentar detectar conteúdo
      try {
        const parsed = JSON.parse(text);
        if (parsed && typeof parsed === "object") {
          onProgressJson(text);
        } else {
          await showAlert(t('app.title'), t('importer.errorUnknown'));
        }
      } catch {
        await showAlert(t('app.title'), t('importer.errorUnknown'));
      }
    }
    // limpar input para permitir re-upload do mesmo arquivo
    e.target.value = "";
  };

  return (
    <label>
      <input type="file" accept=".xml,.json,application/xml,application/json" onChange={handleFile} style={{ display: "none" }} />
      <Button variant="outlined" component="span">{t('toolbar.import')}</Button>
    </label>
  );
};


export default FileImporter;
