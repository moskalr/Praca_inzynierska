import { Button } from "@mui/material";

interface CustomReservationButtonProps {
  label: string;
  action: () => void;
}

const CustomReservationButton: React.FC<CustomReservationButtonProps> = ({
  label,
  action,
}) => {
  return (
    <Button
      onClick={action}
      sx={{
        color: "secondary.main",
        "&:hover": {
          color: "white",
          backgroundColor: "secondary.main",
        },
      }}
    >
      {label}
    </Button>
  );
};

export default CustomReservationButton;
