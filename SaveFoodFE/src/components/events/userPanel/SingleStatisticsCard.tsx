import {
  Card,
  CardHeader,
  Divider,
  CardContent,
  Paper,
  Typography,
} from "@mui/material";
import React from "react";
import CircleDisplay from "./CircleDisplay";
import { accent } from "../../../constants/colors";

interface SingleStatisticsCardProps {
  title: string;
  value: number | string;
  borderStyle: string;
  borderColor?: string;
  percentages?: boolean;
}

function SingleStatisticsCard({
  title,
  value,
  borderStyle,
  borderColor,
  percentages,
}: SingleStatisticsCardProps) {
  return (
    <Card
      sx={{
        borderRadius: "20px",
        transition: "transform 0.2s",
        "&:hover": {
          transform: "scale(1.02)",
        },
        borderColor: "secondary.main",
        marginBottom: "2vh",
      }}
      variant="outlined"
    >
      <CardHeader subheader={<Typography>{title}</Typography>} />
      <Divider />
      <CardContent
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
        }}
      >
        <CircleDisplay
          value={typeof value === "number" ? value.toFixed(3) : value}
          borderStyle={borderStyle}
          borderColor={borderColor || accent}
        />
      </CardContent>
    </Card>
  );
}

export default SingleStatisticsCard;
