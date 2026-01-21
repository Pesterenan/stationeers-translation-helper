import React,  { type ChangeEvent } from "react";
import Button from "@mui/material/Button";
import { readFileAsText } from "../lib/fileHelpers";

type Props = {
  onXml: (fileText: string, fileName?: string) => void;
  onResx: (fileText: string, fileName?: string) => void;
  onProgressJson: (jsonText: string) => void;
};

const FileImporter: React.FC<Props> = ({ onXml, onResx, onProgressJson }) => {
  const handleFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await readFileAsText(file);
    const name = file.name.toLowerCase();
    const isJson = name.endsWith('.json') || name.endsWith('.progress') || file.type === 'application/json';
    const isResx = name.endsWith('.resx') || file.type === 'application/xml';
    const isXml = name.endsWith('.xml') || file.type === 'text/xml';
    if (isJson) { 
      onProgressJson(text)
    } else if (isXml) { 
      onXml(text, file.name)
    } else if (isResx) {
      console.log('file', file.type);
      onResx(text)
    } else {
      // fallback: tentar detectar conteúdo
      try {
        const parsed = JSON.parse(text);
        if (parsed && typeof parsed === "object") {
          onProgressJson(text);
        } else {
          alert("Tipo de arquivo desconhecido.");
        }
      } catch {
        alert("Tipo de arquivo desconhecido. Use .xml ou .json");
      }
    }
    // limpar input para permitir re-upload do mesmo arquivo
    e.currentTarget.value = "";
  };

  return (
    <label>
      <input type="file" accept=".xml,.json,.resx,application/xml,application/json" onChange={handleFile} style={{ display: "none" }} />
      <Button variant="outlined" component="span">Importar XML / JSON</Button>
    </label>
  );
};

export default FileImporter;
