import { Button, Dialog, DialogContent, DialogTitle } from "@mui/material";
import React from "react";
import { primary, secondary } from "../../constants/colors";
import BarcodeScanner from "../../utils/bar_code_scanner/BarcodeScanner";

interface BarcodeScannerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCodeScanned: (data: any) => void;
  t: Function;
}

const BarcodeScannerDialog: React.FC<BarcodeScannerDialogProps> = ({
  isOpen,
  onClose,
  onCodeScanned,
  t,
}) => (
  <Dialog open={isOpen} onClose={onClose}>
    <DialogTitle
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: primary,
      }}
    >
      {t("fridge.actions.scan")}
    </DialogTitle>
    <DialogContent
      style={{
        backgroundColor: primary,
      }}
    >
      <BarcodeScanner onCodeScanned={onCodeScanned} onClose={onClose} t={t} />
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Button
          type="button"
          variant="contained"
          style={{ color: secondary, marginTop: "10px" }}
          onClick={onClose}
        >
          {t("confirmationDialog.cancel")}
        </Button>
      </div>
    </DialogContent>
  </Dialog>
);

export default BarcodeScannerDialog;
