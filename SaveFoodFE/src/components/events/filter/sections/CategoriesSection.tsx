import { List, ListItem, ListItemText } from "@mui/material";
import { useTranslation } from "react-i18next";
import { eaaDictionary } from "../../../../constants/dictionary";
import { productCategories } from "../../../../constants/productCategories";

interface CategoriesSectionProps {
  updateSectionFilters: (category?: string) => void;
}

function CategoriesSection({ updateSectionFilters }: CategoriesSectionProps) {
  const { t } = useTranslation(eaaDictionary);
  function handleCategoryClick(category: string) {
    updateSectionFilters(category);
  }
  return (
    <List>
      {productCategories.map((category, key) => (
        <ListItem key={key} onClick={() => handleCategoryClick(category.value)}>
          <ListItemText
            primary={t(`category.${category.label.toLowerCase()}`)}
          />
        </ListItem>
      ))}
    </List>
  );
}

export default CategoriesSection;
