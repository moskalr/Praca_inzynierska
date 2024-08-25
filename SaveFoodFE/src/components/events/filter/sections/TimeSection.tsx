import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import { Box, IconButton, Stack, Typography } from "@mui/material";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { eaaDictionary } from "../../../../constants/dictionary";
import { FilterFormData } from "../../../../type/mzwo";
import {
  formatDate,
  formatLocalDateTime,
  formatTime,
} from "../../../../utils/date/date";
import EventDateTimePickerDialog from "../../date/EventDateTimePickerDialog";

interface TimeSectionProps {
  updateSectionFilters: (startDate?: string, endDate?: string) => void;
}

const textFieldVariant = "standard";

function TimeSection({ updateSectionFilters }: TimeSectionProps) {
  const { register, handleSubmit, formState, getValues, setValue, reset } =
    useForm<FilterFormData>();
  const [isDatePickerOpen, setisdatePickerOpen] = useState(false);
  const { t } = useTranslation(eaaDictionary);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const onSubmit = () => {
    updateSectionFilters(startDate, endDate);
  };

  const handleDateTimeChange =
    (field: "startDate" | "endDate") => (date: Date | null) => {
      if (date) {
        const formattedDate = formatLocalDateTime(date.toString());
        setValue(field, formattedDate);
        if (field === "startDate") {
          setStartDate(formattedDate);
          return;
        }
        setEndDate(formattedDate);
      }
    };

  const handleDatePickerOpen = () => {
    setisdatePickerOpen((prev) => !prev);
  };

  return (
    <Typography>
      <Stack spacing={2}>
        <Box onClick={handleDatePickerOpen}>
          <Typography>{t("events.filter.event.from")}</Typography>
          <Typography>
            {getValues("startDate")
              ? `${formatDate(String(getValues("startDate")))} ${formatTime(
                  String(getValues("startDate"))
                )}`
              : "-"}
          </Typography>
          <Typography>{t("events.filter.event.to")}</Typography>
          <Typography>
            {getValues("endDate")
              ? `${formatDate(String(getValues("endDate")))} ${formatTime(
                  String(getValues("endDate"))
                )}`
              : "-"}
          </Typography>
        </Box>
      </Stack>

      <EventDateTimePickerDialog
        open={isDatePickerOpen}
        onClose={handleDatePickerOpen}
        startDate={null}
        endDate={null}
        onStartDateChange={handleDateTimeChange("startDate")}
        onEndDateChange={handleDateTimeChange("endDate")}
        onAccept={handleDatePickerOpen}
        initialValue={""}
      />
      <IconButton onClick={onSubmit}>
        <CheckRoundedIcon />
      </IconButton>
    </Typography>
  );
}

export default TimeSection;
