import { AccordionSummary, Typography } from "@mui/material";
import React from "react";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

interface AccordionSectionHeaderProps {
  headerTitle: string;
  color: string;
  headerSize: string;
  fontSize: string;
}

function AccordionSectionHeader({
  headerTitle,
  color,
  headerSize,
  fontSize,
}: AccordionSectionHeaderProps) {
  return (
    <AccordionSummary
      sx={{
        backgroundColor: color,
        height: headerSize,
      }}
      expandIcon={<ExpandMoreIcon />}
    >
      <Typography sx={{ fontSize: fontSize, color: "secondary.main" }}>
        {headerTitle}
      </Typography>
    </AccordionSummary>
  );
}

export default AccordionSectionHeader;
