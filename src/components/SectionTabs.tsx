import React from "react";
import { Paper, Tabs, Tab, Box, Chip } from "@mui/material";
import { useTranslationContext } from "../context/TranslationContext";

const SectionTabs: React.FC = () => {
  const { activeSection, categories, sections, changeTab } =
    useTranslationContext();

  if (sections.length === 0) return null;

  return (
    <Paper variant="outlined">
      <Tabs
        value={activeSection || false}
        onChange={(_, newValue) => changeTab(newValue)}
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
            (e) => e.status === "saved",
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
