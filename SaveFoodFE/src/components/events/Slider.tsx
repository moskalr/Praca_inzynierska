import React from "react";
import { Slider, Stack, Typography } from "@mui/material";

interface SliderComponentProps {
  sliderValue: number;
  handleSliderChange: (event: Event, newValue: number | number[]) => void;
  maxReservationQuantity: number;
}

function SliderComponent({
  sliderValue,
  handleSliderChange,
  maxReservationQuantity,
}: SliderComponentProps) {
  return (
    <Stack spacing={2} direction="row" sx={{ mb: 1 }} alignItems="center">
      <Typography>1</Typography>
      <Slider
        value={sliderValue}
        onChange={handleSliderChange}
        min={1}
        max={maxReservationQuantity}
        aria-labelledby="discrete-slider"
        valueLabelDisplay="auto"
        valueLabelFormat={(value) => `${value}`}
        sx={{ color: "secondary.main" }}
      />
      <Typography>{maxReservationQuantity}</Typography>
    </Stack>
  );
}

export default SliderComponent;
