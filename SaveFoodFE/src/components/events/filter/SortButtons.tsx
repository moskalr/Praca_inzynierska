import KeyboardDoubleArrowDownRoundedIcon from "@mui/icons-material/KeyboardDoubleArrowDownRounded";
import KeyboardDoubleArrowUpRoundedIcon from "@mui/icons-material/KeyboardDoubleArrowUpRounded";
import { Box, Button } from "@mui/material";
import { useTranslation } from "react-i18next";
import { eaaDictionary } from "../../../constants/dictionary";

interface SortButtonsProps {
  sortFilter: string;
  sortAscending: (sortFilter: string) => void;
  sortDescending: (sortFilter: string) => void;
}

function SortButtons({
  sortFilter,
  sortAscending,
  sortDescending,
}: SortButtonsProps) {
  const { t } = useTranslation(eaaDictionary);
  return (
    <Box>
      <Button
        startIcon={<KeyboardDoubleArrowUpRoundedIcon />}
        sx={{ color: "secondary.main" }}
        onClick={() => sortAscending(sortFilter)}
      >
        {t("events.sortBy.ascending")}
      </Button>
      <Button
        startIcon={<KeyboardDoubleArrowDownRoundedIcon />}
        sx={{ color: "secondary.main" }}
        onClick={() => sortDescending(sortFilter)}
      >
        {t("events.sortBy.descending")}
      </Button>
    </Box>
  );
}

export default SortButtons;
