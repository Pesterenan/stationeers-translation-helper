import React,  { type ChangeEvent } from "react";
import Button from "@mui/material/Button";
import { readFileAsText } from "../lib/fileHelpers";

type Props = {
  onXml: (fileText: string, fileName?: string) => void;
  onProgressJson: (jsonText: string) => void;
};

const FileImporter: React.FC<Props> = ({ onXml, onProgressJson }) => {
  const handleFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await readFileAsText(file);
    const name = file.name.toLowerCase();
    if (name.endsWith(".xml") || file.type === "text/xml") {
      onXml(text, file.name);
    } else if (name.endsWith(".json") || file.type === "application/json" || name.endsWith(".progress")) {
      onProgressJson(text);
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
      <input type="file" accept=".xml,.json,application/xml,application/json" onChange={handleFile} style={{ display: "none" }} />
      <Button variant="outlined" component="span">Importar XML / JSON</Button>
    </label>
  );
};

export default FileImporter;
