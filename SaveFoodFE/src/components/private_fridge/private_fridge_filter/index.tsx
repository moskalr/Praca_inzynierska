import TuneIcon from "@mui/icons-material/Tune";
import { IconButton } from "@mui/material";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { useTranslation } from "next-i18next";
import { useRef, useState } from "react";

export function FilterPrivateFridgeList({
  onFilterChange,
}: {
  onFilterChange: (isArchived: boolean | null) => void;
}) {
  const { t } = useTranslation("private_fridge");
  const [isFilterOptionsOpen, setIsFilterOptionsOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<boolean | null>(null);

  const buttonRef = useRef<any>(null);

  const handleOpenPrivateFridgeFilterOption = () =>
    setIsFilterOptionsOpen((prev) => !prev);

  const handleClosePrivateFridgeFilterOption = () =>
    setIsFilterOptionsOpen(false);

  const handleFilterChange = (isArchived: boolean | null) => {
    setSelectedFilter(isArchived);
    onFilterChange(isArchived);
    handleClosePrivateFridgeFilterOption();
  };

  return (
    <>
      <IconButton
        ref={buttonRef}
        className="ms-2"
        id="basic-button"
        aria-controls={isFilterOptionsOpen ? "basic-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={isFilterOptionsOpen ? "true" : undefined}
        onClick={handleOpenPrivateFridgeFilterOption}
      >
        <TuneIcon />
      </IconButton>
      <Menu
        id="basic-menu"
        anchorEl={buttonRef.current}
        open={isFilterOptionsOpen}
        onClose={handleClosePrivateFridgeFilterOption}
        MenuListProps={{
          "aria-labelledby": "basic-button",
        }}
      >
        <MenuItem onClick={() => handleFilterChange(null)}>
          {t("private_fridge.filter_menu.all")}
        </MenuItem>
        <MenuItem onClick={() => handleFilterChange(false)}>
          {t("private_fridge.filter_menu.active")}
        </MenuItem>
        <MenuItem onClick={() => handleFilterChange(true)}>
          {t("private_fridge.filter_menu.archived")}
        </MenuItem>
      </Menu>
    </>
  );
}
