import { Box, Divider, Stack, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { eaaDictionary } from "../../../../constants/dictionary";
import SortButtons from "../SortButtons";

interface SortSectionProps {
  handleSortParameters: (sortFilter: string, direction: string) => void;
}

const availableFoodQuantity = "availableFoodQuantity";
const availableSlots = "availableSlots";
const maxParticipants = "maxParticipants";

function SortSection({ handleSortParameters }: SortSectionProps) {
  const { t } = useTranslation(eaaDictionary);

  const sortAscending = (sortFilter: string) => {
    handleSortParameters(sortFilter, "ascending");
  };

  const sortDescending = (sortFilter: string) => {
    handleSortParameters(sortFilter, "descending");
  };

  return (
    <Stack
      direction="column"
      justifyContent="space-between"
      alignItems="center"
      spacing={2}
    >
      <Box>
        <Typography>{t("events.sortBy.availableFoodQuantity")}</Typography>
        <SortButtons
          sortFilter={availableFoodQuantity}
          sortAscending={sortAscending}
          sortDescending={sortDescending}
        />
      </Box>
      <Box>
        <Divider sx={{ backgroundColor: "primary.main" }} />
        <Typography>{t("events.sortBy.availableSlots")}</Typography>
        <SortButtons
          sortFilter={availableSlots}
          sortAscending={sortAscending}
          sortDescending={sortDescending}
        />
      </Box>
      <Box>
        <Divider sx={{ backgroundColor: "primary.main" }} />
        <Typography>{t("events.sortBy.maxParticipants")}</Typography>
        <SortButtons
          sortFilter={maxParticipants}
          sortAscending={sortAscending}
          sortDescending={sortDescending}
        />
      </Box>
    </Stack>
  );
}

export default SortSection;
