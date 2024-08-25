import { Avatar } from "@mui/material";
import { ReactNode } from "react";
import { primary } from "../../constants/colors";

export interface LinkProps {
  icon: ReactNode;
}

export default function ExternalIcon({ icon }: LinkProps) {
  return <Avatar sx={{ m: 1, bgcolor: primary }}>{icon}</Avatar>;
}
