import { Button } from "@mui/material";
import React from "react";
import { secondary } from "../../constants/colors";

interface MonthButtonProps {
  value: number;
  label: string;
  onClick: (value: number) => void;
}

const MonthButton: React.FC<MonthButtonProps> = ({ value, label, onClick }) => {
  return (
    <Button
      variant="outlined"
      style={{ color: secondary, marginRight: "8px" }}
      onClick={() => onClick(value)}
    >
      {label}
    </Button>
  );
};

export default MonthButton;
