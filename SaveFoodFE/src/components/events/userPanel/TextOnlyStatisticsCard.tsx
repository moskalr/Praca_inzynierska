import {
  Card,
  CardHeader,
  Typography,
  Divider,
  CardContent,
  Grid,
} from "@mui/material";
import React from "react";

interface TextOnlyStatisticsCardProps {
  title: string;
  value: number | string;
  icon?: React.ReactNode;
}

function TextOnlyStatisticsCard({
  title,
  value,
  icon,
}: TextOnlyStatisticsCardProps) {
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
      <CardContent>
        <Grid container spacing={2} alignItems="center" justifyContent="center">
          <Grid item xs={icon ? 6 : 12}>
            <Typography variant="h4">{value}</Typography>
            <Typography variant="subtitle2">{title}</Typography>
          </Grid>
          {icon && (
            <Grid item xs={6}>
              {icon}
            </Grid>
          )}
        </Grid>
      </CardContent>
    </Card>
  );
}

export default TextOnlyStatisticsCard;
