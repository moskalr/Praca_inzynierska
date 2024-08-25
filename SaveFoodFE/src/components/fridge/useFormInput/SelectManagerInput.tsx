import { MenuItem, Select } from "@mui/material";
import React from "react";
import { Account } from "../../../type/mzls";

interface SelectManagerInputProps {
  defaultValue?: string;
  field?: any;
  fieldState: any;
  managers?: Account[];
}

const SelectManagerInput: React.FC<SelectManagerInputProps> = ({
  defaultValue,
  managers,
  field,
  fieldState,
}) => {
  return (
    <Select
      defaultValue={defaultValue}
      variant="outlined"
      size="small"
      labelId="manager-label"
      id="manager-select"
      {...field}
      error={!!fieldState.error}
    >
      {managers &&
        managers.map((manager) => (
          <MenuItem key={manager.id} value={manager.username}>
            {manager.username}
          </MenuItem>
        ))}
    </Select>
  );
};

export default SelectManagerInput;
