import { useState } from "react";

export const useSliderChange = (defaultValue: number) => {
  const [sliderValue, setSliderValue] = useState(defaultValue);

  const handleSliderChange = (event: Event, newValue: number | number[]) => {
    setSliderValue(newValue as number);
  };

  return { sliderValue, handleSliderChange };
};
