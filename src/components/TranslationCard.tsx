import React from "react";
import type { Entry } from "../types";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";

type Props = {
  entry: Entry;
  onChange: (key: string, value: string) => void;
};

export default function TranslationCard({ entry, onChange }: Props) {
  return (
    <Card variant="outlined" sx={{ mb: 2 }}>
      <CardContent>
        <Typography variant="body2">
          ID:
          <Typography variant="caption" color="text.secondary" padding={1}>
            {entry.key}
          </Typography>
        </Typography>
        <Typography variant="body2">
          Original:
          <Typography variant="caption" paddingInline={2}>
            {entry.original}
          </Typography>
        </Typography>
        <Box sx={{ mt: 2 }}>
          <TextField
            fullWidth
            label="Tradução"
            value={entry.translation ?? ""}
            onChange={(e) => onChange(entry.key, e.target.value)}
            size="small"
          />
        </Box>
      </CardContent>
    </Card>
  );
}
