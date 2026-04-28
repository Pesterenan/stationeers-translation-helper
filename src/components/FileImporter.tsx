import React, { type ChangeEvent } from "react";
import Button from "@mui/material/Button";
import { readFileAsText } from "../lib/fileHelpers";
import { useI18nContext } from "../context/useI18nContext";
import { useDialogContext } from "../context/useDialogContext";
import { useTranslationContext } from "../context/useTranslationContext";

interface IProps {
  onXml: (fileText: string, fileName?: string, version?: string) => void;
  onProgressJson: (jsonText: string) => void;
  onStart?: () => void;
}

const FileImporter: React.FC<IProps> = ({ onXml, onProgressJson, onStart }) => {
  const { t } = useI18nContext();
  const { showAlert, showConfirm } = useDialogContext();
  const { importTranslationsFromXml, xmlDoc, originalFileName } = useTranslationContext();

  const handleFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    onStart?.();
    await new Promise(resolve => setTimeout(resolve, 50));

    const text = await readFileAsText(file);
    const name = file.name.toLowerCase();

    const isJson = name.endsWith('.json') || name.endsWith('.progress') || file.type === 'application/json';
    const isXml = name.endsWith('.xml') || file.type === 'text/xml';

    if (isXml) {
      const isMaster = name.startsWith('english');
      const isInitialMock = originalFileName === "language_file_example.xml" || !xmlDoc;

      if (isMaster) {
        // Se for um arquivo mestre, carrega normalmente como base
        onXml(text, file.name, file.lastModified.toString());
      } else if (!isInitialMock) {
        // Se um projeto real já estiver aberto, oferece o merge
        const confirmMerge = await showConfirm(t('app.title'), t('importer.askMerge'));
        if (confirmMerge) {
          importTranslationsFromXml(text);
        }
      } else {
        // Se ainda estiver no mock inicial e tentar carregar algo que não seja mestre, bloqueia
        await showAlert(t('app.title'), <div>{t('importer.errorPrefix')}<br />{t('importer.importHelp')}</div>);
      }
    } else if (isJson) {
      onProgressJson(text)
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
