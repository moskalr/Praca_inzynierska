import CloseIcon from "@mui/icons-material/Close";
import { IconButton } from "@mui/material";
import { useSnackbar, SnackbarKey } from "notistack";

interface SnackbarCloseButtonProps {
  snackbarKey: SnackbarKey;
}

function SnackbarCloseButton({ snackbarKey }: SnackbarCloseButtonProps) {
  const { closeSnackbar } = useSnackbar();

  return (
    <IconButton onClick={() => closeSnackbar(snackbarKey)}>
      <CloseIcon sx={{ color: "white" }} />
    </IconButton>
  );
}

export default SnackbarCloseButton;
