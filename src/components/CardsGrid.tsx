import React from "react";
import Pagination from "@mui/material/Pagination";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import TranslationCard from "./TranslationCard";
import { type Entry } from "../types";

type Props = {
  entries: Entry[];
  pageSize?: number;
  page: number;
  onPageChange: (newPage: number) => void;
  onChange: (id: string, value: string) => void;
  onAccept: (id: string) => void;
};

const CardsGrid: React.FC<Props> = ({
  entries,
  pageSize = 20,
  page,
  onPageChange,
  onChange,
  onAccept,
}) => {
  const totalPages = Math.max(1, Math.ceil(entries.length / pageSize));
  const start = (page - 1) * pageSize;
  const slice = entries.slice(start, start + pageSize);

  return (
    <Box>
      <Grid container justifyContent="center">
        <Pagination
          count={totalPages}
          page={page}
          onChange={(_, p) => onPageChange(p)}
        />
      </Grid>

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
              onChange={onChange}
              onAccept={onAccept}
            />
          </Grid>
        ))}
      </Grid>

      <Grid container justifyContent="center">
        <Pagination
          count={totalPages}
          page={page}
          onChange={(_, p) => onPageChange(p)}
        />
      </Grid>
    </Box>
  );
};

export default CardsGrid;
