import { CircularProgress, Dialog, DialogContent } from "@mui/material";
import React from "react";

interface LoadingStateProps {
  open: boolean;
}

const LoadingState: React.FC<LoadingStateProps> = ({ open }) => (
  <Dialog
    open={open}
    maxWidth="xs"
    PaperProps={{
      style: {
        backgroundColor: "transparent",
        boxShadow: "none",
      },
    }}
  >
    <DialogContent>
      <CircularProgress size={60} />
    </DialogContent>
  </Dialog>
);

export default LoadingState;
