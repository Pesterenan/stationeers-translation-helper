import React, { useMemo } from "react";
import Grid from "@mui/material/Grid";
import TranslationCard from "./TranslationCard";
import { useTranslationContext } from "../context/TranslationContext";

const CardsGrid: React.FC = () => {
  const { categories, activeSection, page, updateEntry, acceptEntry } =
    useTranslationContext();

  const pageSize = 20;

  const currentSectionEntries = useMemo(() => {
    return categories[activeSection] || [];
  }, [categories, activeSection]);

  const start = (page - 1) * pageSize;
  const slice = currentSectionEntries.slice(start, start + pageSize);

  return (
    <Grid container>
      {slice.map((e, idx) => (
        <Grid
          key={e.id}
          padding={1}
          flexGrow={1}
          size={{ xs: 12, sm: 6, md: 4, lg: 3 }}
        >
          <TranslationCard
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

export default CardsGrid;
