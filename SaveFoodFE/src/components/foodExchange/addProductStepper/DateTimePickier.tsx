import {
  Box,
  Dialog,
  DialogTitle,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { DesktopDatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { i18n } from "next-i18next";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { eaaDictionary } from "../../../constants/dictionary";

interface EventDateTimePickerDialogProps {
  open: boolean;
  onClose: () => void;
  startDate: Date | null;
  endDate: Date | null;
  onStartDateChange: (newValue: Date | null) => void;
  onEndDateChange: (newValue: Date | null) => void;
  onAccept: () => void;
  initialValue: string;
}

const DateTimePicker = ({
  open,
  onClose,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onAccept,
  initialValue,
}: EventDateTimePickerDialogProps) => {
  const { t } = useTranslation(eaaDictionary);
  const [tabValue, setTabValue] = useState(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const handleTabChange = (_event: React.ChangeEvent<{}>, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Dialog open={open} onClose={onClose} fullScreen={isMobile}>
      <DialogTitle>{initialValue}</DialogTitle>
      <Box display="flex" flexDirection="column" flexGrow={1} height="100%">
        <LocalizationProvider
          dateAdapter={AdapterDayjs}
          adapterLocale={i18n?.language}
          localeText={{ dateTimePickerToolbarTitle: "" }}
        >
          <DesktopDatePicker
            value={startDate}
            onChange={onStartDateChange}
            onAccept={onAccept}
            disablePast
          />
        </LocalizationProvider>
      </Box>
    </Dialog>
  );
};

export default DateTimePicker;
