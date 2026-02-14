import React, { useMemo } from "react";
import Grid from "@mui/material/Grid";
import TranslationItem from "./TranslationItem";
import { useTranslationContext } from "../context/TranslationContext";
import DialogGoToPage from "./DialogGoToPage";

const TranslationsList: React.FC = () => {
  const { categories, activeSection, page, updateEntry, acceptEntry } =
    useTranslationContext();

  const pageSize = 30;

  const currentSectionEntries = useMemo(() => {
    return categories[activeSection] || [];
  }, [categories, activeSection]);

  const start = (page - 1) * pageSize;
  const slice = currentSectionEntries.slice(start, start + pageSize);

  return (
    <Grid container direction="column" wrap="nowrap">
      <DialogGoToPage />
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
          <TranslationItem
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
