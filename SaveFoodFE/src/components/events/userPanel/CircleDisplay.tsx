import { Paper, Typography } from "@mui/material";
import React from "react";

interface CircleDisplayProps {
  value: number | string;
  borderStyle: string;
  borderColor: string;
}

function CircleDisplay({
  value,
  borderStyle,
  borderColor,
}: CircleDisplayProps) {
  return (
    <Paper
      sx={{
        width: 100,
        height: 100,
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "transform 0.3s",
        "&:hover": {
          transform: "scale(1.2)",
        },
        border: borderStyle,
        borderColor: borderColor,
        borderWidth: "2px",
      }}
    >
      <Typography variant="h5">{value}</Typography>
    </Paper>
  );
}

export default CircleDisplay;
