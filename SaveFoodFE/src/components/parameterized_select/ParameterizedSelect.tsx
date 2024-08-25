import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import { ReactNode } from "react";

const ParameterizedSelect = (props: {
  [x: string]: any;
  label: string;
  defaultValue: string;
  fmiLabel: string;
  smiLabel: string;
  secondValue: string;
  onChange: any;
  firstIcon: ReactNode;
  secondIcon: ReactNode;
}) => {
  const {
    label,
    defaultValue,
    fmiLabel,
    smiLabel,
    secondValue,
    onChange,
    firstIcon,
    secondIcon,
    ...inputProps
  } = props;

  return (
    <FormControl
      fullWidth
      variant="outlined"
      sx={{
        "& .MuiInputLabel-root": {
          color: "#54a5a5",
          "&.Mui-focused": {
            color: "#54a5a5",
          },
        },
        "& .MuiOutlinedInput-root": {
          "& fieldset": {
            borderColor: "#54a5a5",
            borderWidth: 2,
          },
          "&:hover fieldset": {
            borderColor: "#54a5a5",
          },
          "&.Mui-focused fieldset": {
            borderColor: "#54a5a5",
          },
        },
        marginTop: "16px",
      }}
    >
      <InputLabel>{label}</InputLabel>
      <Select required {...{ defaultValue, onChange, label }}>
        <MenuItem value={defaultValue}>
          {firstIcon}
          &nbsp; {fmiLabel}
        </MenuItem>
        <MenuItem value={secondValue}>
          {secondIcon}
          &nbsp; {smiLabel}
        </MenuItem>
      </Select>
    </FormControl>
  );
};

export default ParameterizedSelect;
