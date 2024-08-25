import { FormControlLabel, Radio, RadioGroup } from "@mui/material";
import React from "react";
import { accent, secondary } from "../../../constants/colors";
import {
  UNIT_KG,
  UNIT_KILOGRAMS,
  UNIT_L,
  UNIT_LITERS,
} from "../../../constants/productUnits";

interface UnitSelectionProps {
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const UnitSelection: React.FC<UnitSelectionProps> = ({ value, onChange }) => {
  return (
    <RadioGroup name="productUnit" value={value} onChange={onChange} row>
      <FormControlLabel
        value={UNIT_KILOGRAMS}
        control={
          <Radio
            sx={{
              color: secondary,
              "&.Mui-checked": {
                color: accent,
              },
            }}
          />
        }
        label={UNIT_KG}
      />
      <FormControlLabel
        value={UNIT_LITERS}
        control={
          <Radio
            sx={{
              color: secondary,
              "&.Mui-checked": {
                color: accent,
              },
            }}
          />
        }
        label={UNIT_L}
      />
    </RadioGroup>
  );
};

export default UnitSelection;
