import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import { secondary } from "../../constants/colors";

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  message: string;
  t: Function;
}

const ConfirmationDialog = ({
  isOpen,
  onClose,
  onConfirm,
  message,
  t,
}: ConfirmationDialogProps) => (
  <Dialog open={isOpen} onClose={onClose}>
    <DialogContent>{message}</DialogContent>
    <DialogActions>
      <Button onClick={onClose} style={{ color: secondary }}>
        {t("confirmationDialog.cancel")}
      </Button>
      <Button onClick={onConfirm} style={{ color: secondary }}>
        {t("confirmationDialog.confirm")}
      </Button>
    </DialogActions>
  </Dialog>
);

export default ConfirmationDialog;
