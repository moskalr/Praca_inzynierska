import { Divider, Drawer, IconButton, Typography, styled } from "@mui/material";
import ListFilter from "./ListFilter";

import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { useTranslation } from "react-i18next";
import { eaaDictionary } from "../../../constants/dictionary";

interface MobileFilterDrawerProps {
  isDrawerOpen: boolean;
  handleDrawerOpen: () => void;
  handleUpdateDateSection: (startDate?: string, endDate?: string) => void;
  handleUpdateLocationSection: (city?: string, street?: string) => void;
  handleUpdateStateSection: (state?: string) => void;
  handleUpdateCategorySection: (category?: string) => void;
  handleSortParameters: (sortFilter: string, direction: string) => void;
  resetFilters: () => void;
  isMobile: boolean;
}

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
  justifyContent: "space-between",
}));

function MobileFilterDrawer({
  isDrawerOpen,
  handleDrawerOpen,
  handleUpdateDateSection,
  handleUpdateLocationSection,
  handleUpdateStateSection,
  handleUpdateCategorySection,
  handleSortParameters,
  resetFilters,
  isMobile,
}: MobileFilterDrawerProps) {
  const { t } = useTranslation(eaaDictionary);
  return (
    <Drawer
      sx={{
        position: "sticky",
        width: "95%",
        height: "100%",
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: "95%",
          boxSizing: "border-box",
        },
      }}
      anchor="left"
      open={isDrawerOpen}
    >
      <DrawerHeader sx={{ backgroundColor: "white" }}>
        <Typography
          fontWeight={"bold"}
          fontSize={"large"}
          sx={{ marginLeft: "40vw" }}
        >
          {t("events.filter.title")}
        </Typography>
        <IconButton onClick={handleDrawerOpen}>
          <CloseRoundedIcon />
        </IconButton>
      </DrawerHeader>
      <Divider />
      <ListFilter
        handleUpdateDateSection={handleUpdateDateSection}
        handleUpdateLocationSection={handleUpdateLocationSection}
        handleUpdateStateSection={handleUpdateStateSection}
        handleUpdateCategorySection={handleUpdateCategorySection}
        handleSortParameters={handleSortParameters}
        resetFilters={resetFilters}
        handleDrawerOpen={handleDrawerOpen}
        isMobile={isMobile}
      />
    </Drawer>
  );
}

export default MobileFilterDrawer;
