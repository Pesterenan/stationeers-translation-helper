import React, { useMemo } from "react";
import Grid from "@mui/material/Grid";
import { useTranslationContext } from "../context/useTranslationContext";
import TranslationEntry from "./translationEntry/TranslationEntry";

const PAGE_SIZE = 30;

const TranslationsList: React.FC = () => {
  const { categories, activeSection, page, updateEntry, acceptEntry } =
    useTranslationContext();

  const currentSectionEntries = useMemo(() => {
    return categories[activeSection] || [];
  }, [categories, activeSection]);

  const start = (page - 1) * PAGE_SIZE;
  const slice = currentSectionEntries.slice(start, start + PAGE_SIZE);

  return (
    <Grid container direction="column" wrap="nowrap">
      {slice.map((e, idx) => (
        <Grid
          key={e.id}
          sx={{
            width: "100%",
            borderBottom: "1px solid",
            borderColor: "divider",
            "&:hover": {
              bgcolor: "action.hover",
            }
          }}
        >
          <TranslationEntry
            entry={e}
            index={idx}
            onChange={updateEntry}
            onAccept={acceptEntry}
          />
        </Grid>
      ))}
    </Grid>
  );
};

export default TranslationsList;
