import { format } from "date-fns";

interface DateTimeDisplayProps {
  dateString: string;
  withTime: boolean;
}

const DateTimeDisplay: React.FC<DateTimeDisplayProps> = ({
  dateString,
  withTime,
}) => {
  const date = new Date(dateString);

  return (
    <>
      {withTime
        ? format(date, "dd.MM.yyyy HH:mm:ss")
        : format(date, "dd.MM.yyyy")}
    </>
  );
};

export default DateTimeDisplay;
