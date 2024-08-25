import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import IconButton from "@mui/material/IconButton";
import { Dispatch, SetStateAction } from "react";

interface Props {
  isListOpen: boolean;
  setListOpen: Dispatch<SetStateAction<boolean>>;
}

export function DropDownButton({ isListOpen, setListOpen }: Props) {
  return (
    <IconButton
      aria-label="expand row"
      size="small"
      onClick={() => setListOpen(!isListOpen)}
    >
      {isListOpen ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
    </IconButton>
  );
}
