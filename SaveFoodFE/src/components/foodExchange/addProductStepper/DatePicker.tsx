import { DesktopDatePicker, MobileDatePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

type MobileDatePickerProps = Parameters<
  typeof MobileDatePicker<Date | null>
>[0];
type DesktopDatePickerProps = Parameters<
  typeof DesktopDatePicker<Date | null>
>[0];

type DatePickerProps = {
  isMobile?: boolean;
} & (MobileDatePickerProps | DesktopDatePickerProps);

export const CustomDatePicker: React.FC<DatePickerProps> = ({
  isMobile = false,
  format = "DD/MM/YYYY",
  disablePast = true,
  ...commonProps
}) => {
  if (isMobile) {
    return (
      <MobileDatePicker
        format={format}
        disablePast={disablePast}
        {...commonProps}
      />
    );
  } else {
    return (
      <DesktopDatePicker
        format={format}
        disablePast={disablePast}
        {...commonProps}
      />
    );
  }
};
