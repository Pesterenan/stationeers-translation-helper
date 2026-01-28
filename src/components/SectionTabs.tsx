import React from "react";
import { Paper, Tabs, Tab, Box, Chip } from "@mui/material";
import { type Entry } from "../types";

type Props = {
  sections: string[];
  activeSection: string;
  categories: Record<string, Entry[]>;
  onChange: (newValue: string) => void;
};

const SectionTabs: React.FC<Props> = ({
  sections,
  activeSection,
  categories,
  onChange,
}) => {
  if (sections.length === 0) return null;

  return (
    <Paper variant="outlined" sx={{ mb: 2 }}>
      <Tabs
        value={activeSection || false}
        onChange={(_, newValue) => onChange(newValue)}
        variant="scrollable"
        scrollButtons="auto"
        allowScrollButtonsMobile
        textColor="primary"
        indicatorColor="primary"
        aria-label="seções do arquivo"
      >
        {sections.map((sec) => {
          const sectionEntries = categories[sec] ?? [];
          const totalCount = sectionEntries.length;
          const savedCount = sectionEntries.filter(
            (e) => e.status === "saved"
          ).length;

          return (
            <Tab
              key={sec}
              value={sec}
              label={
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  {sec}
                  <Chip
                    label={`${savedCount} / ${totalCount}`}
                    size="small"
                    color={savedCount === totalCount ? "success" : "default"}
                    variant={savedCount > 0 ? "filled" : "outlined"}
                    sx={{ height: 20, fontSize: "0.7rem" }}
                  />
                </Box>
              }
            />
          );
        })}
      </Tabs>
    </Paper>
  );
};

export default SectionTabs;
