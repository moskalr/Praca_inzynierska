import { TextField } from "@mui/material";
import React from "react";

interface CustomTextFieldProps {
  label: string;
  type: string;
  field: any;
  fieldState: any;
  fullWidth?: boolean;
  multiline?: boolean;
  autoFocus?: boolean;
  required?: boolean;
  sx?: {};
  InputProps?: {};
  inputProps?: {};
  InputLabelProps?: {};
}

const CustomTextField: React.FC<CustomTextFieldProps> = (props) => {
  const { type, field, fieldState, sx, ...otherProps } = props;

  return (
    <TextField
      variant="standard"
      type={type}
      {...field}
      {...otherProps}
      error={!!fieldState && !!fieldState.error}
      helperText={fieldState?.error?.message || ""}
      color="secondary"
    />
  );
};

export default CustomTextField;
