import dayjs from "dayjs";
import { useState } from "react";
import { CreateEventMZWO, EventMZWO } from "../../../type/mzwo";
import { formatLocalDateTime } from "../../../utils/date/date";

export const useDateRange = (event: EventMZWO | CreateEventMZWO) => {
  const [selectedStartDateTime, setSelectedStartDateTime] =
    useState<Date | null>(dayjs().add(5, "minutes") as unknown as Date);
  const [selectedEndDateTime, setSelectedEndDateTime] = useState<Date | null>(
    dayjs().add(5, "minutes") as unknown as Date
  );

  const handleStartDateChange = (newValue: Date | null) => {
    setSelectedStartDateTime(newValue);
    if (selectedStartDateTime) {
      event.startDate = formatLocalDateTime(selectedStartDateTime.toString());
    }
  };

  const handleEndDateChange = (newValue: Date | null) => {
    setSelectedEndDateTime(newValue);
    if (selectedEndDateTime) {
      event.endDate = formatLocalDateTime(selectedEndDateTime.toString());
    }
  };

  return {
    selectedStartDateTime,
    selectedEndDateTime,
    handleStartDateChange,
    handleEndDateChange,
  };
};
