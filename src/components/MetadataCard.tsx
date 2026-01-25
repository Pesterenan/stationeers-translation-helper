import React from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";

type Props = {
  metadata: { Language?: string; Code?: string; Font?: string } | undefined;
  onUpdate: (upd: { Language?: string; Code?: string; Font?: string }) => void;
  onApplyToXml?: () => void; // opcional: aplica imediatamente no xml carregado
};

const MetadataCard: React.FC<Props> = ({ metadata, onUpdate, onApplyToXml }) => {
  const [local, setLocal] = React.useState<{ Language?: string; Code?: string; Font?: string }>(
    metadata ?? {}
  );

  React.useEffect(() => setLocal(metadata ?? {}), [metadata]);

  const change = (k: keyof typeof local, v: string) => {
    const next = { ...local, [k]: v };
    setLocal(next);
    onUpdate(next);
  };

  return (
    <Card sx={{ alignSelf: 'flex-start', position: "sticky", right: 16, top: 16, width: 320, zIndex: 50 }}>
      <CardContent>
        <Typography variant="h6">Metadados</Typography>

        <Box sx={{ mt: 1 }}>
          <TextField
            label="Language (Name)"
            fullWidth
            size="small"
            value={local.Language ?? ""}
            onChange={(e) => change("Language", e.target.value)}
            sx={{ mb: 1 }}
          />
          <TextField
            label="Code (ex: EN, PT)"
            fullWidth
            size="small"
            value={local.Code ?? ""}
            onChange={(e) => change("Code", e.target.value)}
            sx={{ mb: 1 }}
          />
          <TextField
            label="Font"
            fullWidth
            size="small"
            value={local.Font ?? ""}
            onChange={(e) => change("Font", e.target.value)}
            sx={{ mb: 1 }}
          />
        </Box>

        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mt: 1 }}>
          {onApplyToXml && (
            <Button size="small" variant="outlined" onClick={onApplyToXml}>
              Aplicar no XML
            </Button>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default MetadataCard;
