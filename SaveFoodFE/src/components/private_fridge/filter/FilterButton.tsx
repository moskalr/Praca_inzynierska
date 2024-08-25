import { IconButton } from "@mui/material";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { useTranslation } from "next-i18next";
import { useRef, useState } from "react";

const FilterButton = (props: {
  filterOptions: { key: string; value: string }[];
  icon: React.ReactNode;
  selectedValue: string | null;
  filterChangeHandler: (option: string) => void;
  title: string;
}) => {
  const { filterOptions, icon, selectedValue, filterChangeHandler, title } =
    props;
  const { t } = useTranslation("private_fridge");
  const [isFilterOptionsOpen, setIsFilterOptionsOpen] = useState(false);

  const buttonRef = useRef<any>(null);

  const handleOpenFilterOption = () => setIsFilterOptionsOpen((prev) => !prev);

  const handleCloseFilterOption = () => setIsFilterOptionsOpen(false);

  return (
    <>
      <IconButton
        ref={buttonRef}
        className="ms-2"
        id="basic-button"
        aria-controls={isFilterOptionsOpen ? "basic-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={isFilterOptionsOpen ? "true" : undefined}
        onClick={handleOpenFilterOption}
      >
        {icon}
      </IconButton>
      <Menu
        id="basic-menu"
        anchorEl={buttonRef.current}
        open={isFilterOptionsOpen}
        onClose={handleCloseFilterOption}
        MenuListProps={{
          "aria-labelledby": "basic-button",
        }}
      >
        <MenuItem disabled>{title}</MenuItem>
        {filterOptions.map((option) => (
          <MenuItem
            key={option.key}
            selected={selectedValue === option.value}
            onClick={() => {
              filterChangeHandler(option.value);
              handleCloseFilterOption();
            }}
          >
            {t(`filter.${option.key}`)}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default FilterButton;
