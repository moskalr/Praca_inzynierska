import CloseIcon from "@mui/icons-material/Close";
import { Dialog, DialogContent, DialogTitle, IconButton } from "@mui/material";
import React from "react";
import Scanner from "./Scanner";

interface BarcodeScannerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCodeScanned: (data: any) => void;
  t: Function;
}

const ScannerWindow: React.FC<BarcodeScannerDialogProps> = ({
  isOpen,
  onClose,
  onCodeScanned,
  t,
}) => (
  <Dialog fullScreen open={isOpen} onClose={onClose}>
    <DialogTitle
      style={{
        height: "5vh",
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <div style={{ textAlign: "left" }}>{t("products.form.scan")}</div>

      <IconButton aria-label="expand row" size="small" onClick={onClose}>
        <CloseIcon />
      </IconButton>
    </DialogTitle>
    <DialogContent>
      <Scanner onCodeScanned={onCodeScanned} onClose={onClose} t={t} />
    </DialogContent>
  </Dialog>
);

export default ScannerWindow;
