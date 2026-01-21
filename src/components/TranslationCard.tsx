import React, { useState } from "react";
import type { Entry } from "../types";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import { alpha, useTheme } from "@mui/material/styles";

type Props = {
  entry: Entry;
  onChange: (key: string, value: string) => void;
  onAccept: (key: string) => void;
};

const TranslationCard: React.FC<Props> = ({ entry, onChange, onAccept }) => {
  const theme = useTheme();
  const [translation, setTranslation] = useState(entry.translation ?? "");

  const backgroundColor =
    entry.status === "edited"
      ? alpha(
          theme.palette.warning.main,
          theme.palette.mode === "dark" ? 0.2 : 0.15,
        )
      : entry.status === "saved"
        ? alpha(
            theme.palette.success.main,
            theme.palette.mode === "dark" ? 0.2 : 0.15,
          )
        : "transparent";

  return (
    <Card
      variant="elevation"
      sx={{ backgroundColor, transition: "background-color 0.2s ease" }}
    >
      <CardContent>
        <Grid flexWrap="nowrap">
          <Typography component="span" fontWeight="bold" variant="body2">
            ID:
          </Typography>{" "}
          <Typography
            color="warning"
            component="span"
            fontStyle="italic"
            variant="caption"
          >
            {entry.key}
          </Typography>
        </Grid>

        <Grid flexWrap="nowrap">
          <Typography component="span" fontWeight="bold" variant="body2">
            Original:
          </Typography>{" "}
          <Typography component="span" variant="caption" paddingInline={2}>
            {entry.original}
          </Typography>
        </Grid>

        <Grid alignItems="center" container flexWrap="nowrap" marginTop={1}>
          <Grid flexGrow={1}>
            <TextField
              fullWidth
              label="Tradução"
              value={translation}
              onChange={(e) => setTranslation(e.target.value)}
              onBlur={() => onChange(entry.key, translation)}
              size="small"
            />
          </Grid>

          <Grid paddingLeft={1}>
            <Button
              size="small"
              fullWidth
              variant="contained"
              onClick={() => onAccept(entry.key)}
            >
              Aceitar
            </Button>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default TranslationCard;
