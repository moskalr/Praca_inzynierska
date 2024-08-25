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
import styles from "../../styles/favorities.module.css";
import { SocialFridge } from "../../type/mzls";

interface FridgeSelectProps {
  field: {
    onChange: (value: any) => void;
    value: any;
  };
  fieldState: any;
  availableFridges: SocialFridge[];
  t: Function;
}

const FridgeSelect: React.FC<FridgeSelectProps> = ({
  field,
  fieldState,
  availableFridges,
  t,
}) => {
  return (
    <FormControl className={styles["fridges-select"]}>
      <InputLabel htmlFor="fridges" style={{ color: secondary }}>
        {t("preferences.dialogs.select_fridges_label")}
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
          {t("preferences.dialogs.select_fridges_placeholder")}
        </MenuItem>
        {availableFridges.map((fridge) => (
          <MenuItem key={fridge.id} value={fridge.id}>
            <div className={styles["checkbox-container"]}>
              <Checkbox checked={field.value?.includes(fridge.id) || false} />
              <span>
                {fridge.address.street},{fridge.address.buildingNumber},{" "}
                {fridge.address.city}, {fridge.address.postalCode}
              </span>
              {field.value?.includes(fridge.id) && (
                <IconButton
                  style={{ marginLeft: "auto" }}
                  onClick={() => {
                    field.onChange(
                      field.value?.filter((f: number) => f !== fridge.id) || []
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

export default FridgeSelect;
