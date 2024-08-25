import DeleteIcon from "@mui/icons-material/Delete";
import {
  Checkbox,
  FormControl,
  FormHelperText,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material";
import { useController } from "react-hook-form";
import { accent, secondary } from "../../../constants/colors";

interface SelectInputProps {
  label: string;
  options: any[];
  control?: any;
  name: string;
  defaultValue?: any;
  t: Function;
}

const SelectInput: React.FC<SelectInputProps> = ({
  label,
  options,
  control,
  name,
  defaultValue,
  t,
}) => {
  const { field, fieldState } = useController({
    control,
    defaultValue: defaultValue || [],
    name,
  });

  return (
    <FormControl
      style={{ width: "100%", marginTop: "8px" }}
      error={!!fieldState?.error}
    >
      <InputLabel
        shrink
        htmlFor={name}
        style={{
          color: secondary,
          position: "absolute",
          top: "-8px",
        }}
      >
        {label}
      </InputLabel>
      <Select multiple {...field}>
        {options.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            <div style={{ display: "flex", alignItems: "center" }}>
              <Checkbox
                checked={field.value?.includes(option.value) || false}
                sx={{
                  color: accent,
                  "&.Mui-checked": {
                    color: secondary,
                  },
                }}
              />
              <span>
                {t(option.label, {
                  defaultValue: option.value,
                })}
              </span>
              {field.value?.includes(option.value) && (
                <IconButton
                  style={{ marginLeft: "auto", color: secondary }}
                  onClick={() => {
                    field.onChange(
                      field.value?.filter((v: any) => v !== option.value) || []
                    );
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              )}
            </div>
          </MenuItem>
        ))}
      </Select>
      {fieldState?.error && (
        <FormHelperText>{fieldState.error.message}</FormHelperText>
      )}
    </FormControl>
  );
};

export default SelectInput;

