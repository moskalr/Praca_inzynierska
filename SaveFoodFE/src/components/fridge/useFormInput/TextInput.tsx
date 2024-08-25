import { TextField } from "@mui/material";
import React from "react";
import { accent, secondary } from "../../../constants/colors";

interface TextInputProps {
  defaultValue?: string | Date;
  label: string;
  multiline?: boolean;
  autoFocus?: boolean;
  rows?: number;
  field?: any;
  fieldState: any;
  type?: "text" | "date" | "number";
  inputProps?: object;
  inputLabelProps?: object;
}

const TextInput: React.FC<TextInputProps> = ({
  defaultValue,
  label,
  multiline = false,
  autoFocus = false,
  rows = 1,
  field,
  fieldState,
  type = "text",
  inputProps = {},
  inputLabelProps = {},
}) => {
  return (
    <TextField
      label={label}
      autoFocus={autoFocus}
      multiline={multiline}
      rows={rows}
      type={type}
      defaultValue={defaultValue}
      InputLabelProps={{
        shrink: true,
        sx: {
          color: secondary,
          "&.Mui-focused": {
            color: accent,
          },
        },
        ...inputLabelProps,
      }}
      inputProps={{
        min: new Date().toISOString().split("T")[0],
        ...inputProps,
      }}
      {...field}
      error={!!fieldState && !!fieldState.error}
      helperText={fieldState?.error?.message || ""}
    />
  );
};

export default TextInput;
