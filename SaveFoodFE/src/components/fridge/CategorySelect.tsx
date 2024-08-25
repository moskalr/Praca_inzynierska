import DeleteIcon from "@mui/icons-material/Delete";
import {
  Checkbox,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material";
import React from "react";
import { secondary } from "../../constants/colors";
import { Categories } from "../../utils/categories/categories";

interface CategorySelectProps {
  field: {
    onChange: (value: any) => void;
    value: any;
  };
  fieldState: any;
  availableCategories: Categories[];
  t: Function;
}

const CategorySelect: React.FC<CategorySelectProps> = ({
  field,
  fieldState,
  availableCategories,
  t,
}) => {
  return (
    <FormControl>
      <InputLabel htmlFor="categories" style={{ color: secondary }}>
        {t("preferences.dialogs.select_categories_label")}
      </InputLabel>
      <Select
        multiple
        {...field}
        error={!!fieldState.error}
        value={field.value || []}
        onChange={(e) => {
          field.onChange(e);
        }}
      >
        <MenuItem value="">
          {t("preferences.dialogs.select_categories_placeholder")}
        </MenuItem>
        {availableCategories.map((category) => (
          <MenuItem key={category} value={category}>
            <div style={{ display: "flex", alignItems: "center" }}>
              <Checkbox checked={field.value?.includes(category) || false} />
              <span>
                {t(`categories.${category}`, {
                  defaultValue: category,
                })}
              </span>
              {field.value?.includes(category) && (
                <IconButton
                  style={{ marginLeft: "auto" }}
                  onClick={() => {
                    field.onChange(
                      field.value?.filter((c: Categories) => c !== category) ||
                        []
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
    </FormControl>
  );
};

export default CategorySelect;
