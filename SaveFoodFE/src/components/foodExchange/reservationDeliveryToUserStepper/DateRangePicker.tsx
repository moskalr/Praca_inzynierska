import { Typography, TypographyVariant } from "@mui/material";
import { DateField, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { useTranslation } from "react-i18next";

import dayjs from "dayjs";
import { i18n } from "next-i18next";
import { foodExchangeDictionary } from "../../../constants/dictionary";

const translation = "Tabs.AllDeliveries.MakeReservationStepper.ReceiptDetails.";

type DateRangePickerProps = {
  startExchangeDate: dayjs.Dayjs;
  endExchangeDate: dayjs.Dayjs;
};

export function DateRangePicker({
  startExchangeDate,
  endExchangeDate,
}: DateRangePickerProps) {
  const { t } = useTranslation(foodExchangeDictionary);

  return (
    <>
      <Typography variant={"buttom" as TypographyVariant} align="left">
        {t(translation + "fromDay")}
      </Typography>
      <Typography>
        <LocalizationProvider
          dateAdapter={AdapterDayjs}
          adapterLocale={i18n?.language}
        >
          <DateField defaultValue={startExchangeDate} />
        </LocalizationProvider>
      </Typography>
      <Typography variant={"buttom" as TypographyVariant}>
        {t(translation + "toDay")}
      </Typography>
      <Typography>
        <LocalizationProvider
          dateAdapter={AdapterDayjs}
          adapterLocale={i18n?.language}
        >
          <DateField defaultValue={endExchangeDate} />
        </LocalizationProvider>
      </Typography>
    </>
  );
}
