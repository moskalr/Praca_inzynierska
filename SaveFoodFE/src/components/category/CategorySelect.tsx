import {
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent,
} from "@mui/material";
import React from "react";
import styles from "../../styles/product.module.css";
import { Categories } from "../../utils/categories";
import { secondary } from "../../constants/colors";

interface CategorySelectProps {
  categories: Categories[];
  value?: Categories;
  onChange?: (event: SelectChangeEvent<Categories>) => void;
  t: Function;
}

const CategorySelect: React.FC<CategorySelectProps> = ({
  categories,
  value,
  onChange,
  t,
}) => (
  <FormControl
    variant="outlined"
    size="small"
    className={styles["category-select"]}
  >
    <InputLabel style={{ color: secondary }} htmlFor="search-category">
      {t("categoryLabel")}
    </InputLabel>
    <Select
      label={t("categoryLabel")}
      variant="outlined"
      size="small"
      native={true}
      value={value || ""}
      onChange={onChange as (event: SelectChangeEvent<Categories>) => void}
      inputProps={{
        name: "search-category",
        id: "search-category",
      }}
    >
      <option value=""></option>
      {categories.map((category) => (
        <option key={category} value={category}>
          {t(`categories.${category}`, { defaultValue: category })}
        </option>
      ))}
    </Select>
  </FormControl>
);

export default CategorySelect;
