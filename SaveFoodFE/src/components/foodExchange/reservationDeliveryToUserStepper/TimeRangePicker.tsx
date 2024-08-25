import { Typography, TypographyVariant } from "@mui/material";
import { LocalizationProvider, TimeField } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { useTranslation } from "react-i18next";

import dayjs from "dayjs";
import { i18n } from "next-i18next";
import { foodExchangeDictionary } from "../../../constants/dictionary";

const translation = "Tabs.AllDeliveries.MakeReservationStepper.ReceiptDetails.";

type TimeRangePickerProps = {
  startExchangeTime: dayjs.Dayjs;
  endExchangeTime: dayjs.Dayjs;
};

export function TimeRangePicker({
  startExchangeTime,
  endExchangeTime,
}: TimeRangePickerProps) {
  const { t } = useTranslation(foodExchangeDictionary);

  return (
    <>
      <Typography variant={"buttom" as TypographyVariant}>
        {t(translation + "fromHour")}
      </Typography>
      <Typography>
        <LocalizationProvider
          dateAdapter={AdapterDayjs}
          adapterLocale={i18n?.language}
        >
          <TimeField defaultValue={startExchangeTime} />
        </LocalizationProvider>
      </Typography>
      <Typography variant={"buttom" as TypographyVariant}>
        {t(translation + "toHour")}
      </Typography>
      <Typography>
        <LocalizationProvider
          dateAdapter={AdapterDayjs}
          adapterLocale={i18n?.language}
        >
          <TimeField defaultValue={endExchangeTime} />
        </LocalizationProvider>
      </Typography>
    </>
  );
}
