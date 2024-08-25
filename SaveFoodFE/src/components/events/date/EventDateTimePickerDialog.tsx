import {
  Box,
  Dialog,
  DialogTitle,
  Tab,
  Tabs,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  LocalizationProvider,
  StaticDateTimePicker,
} from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import TabPanel from "../tabs/TabPanel";
import "dayjs/locale/pl";
import "dayjs/locale/en";
import { i18n } from "next-i18next";
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

const EventDateTimePickerDialog = ({
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
        <Tabs
          variant="fullWidth"
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="secondary"
          textColor="secondary"
        >
          <Tab label={t("events.dialog.startDate")} />
          <Tab label={t("events.dialog.endDate")} />
        </Tabs>
        <LocalizationProvider
          dateAdapter={AdapterDayjs}
          localeText={{ dateTimePickerToolbarTitle: "" }}
          adapterLocale={i18n?.language}
        >
          <TabPanel value={tabValue} index={0}>
            <StaticDateTimePicker
              value={startDate}
              onChange={onStartDateChange}
              onAccept={onAccept}
              ampm={false}
              disablePast
            />
          </TabPanel>
          <TabPanel value={tabValue} index={1}>
            <StaticDateTimePicker
              value={endDate}
              onChange={onEndDateChange}
              onAccept={onAccept}
              ampm={false}
              disablePast
            />
          </TabPanel>
        </LocalizationProvider>
      </Box>
    </Dialog>
  );
};

export default EventDateTimePickerDialog;
