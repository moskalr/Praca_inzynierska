import { enqueueSnackbar } from "notistack";

type SnackbarVariant = "error" | "success" | "info";

export const snackbar = (
  messageKey: string,
  variant: SnackbarVariant,
  t: Function
) => {
  enqueueSnackbar(t(`${messageKey}`), {
    variant,
  });
};

export default snackbar;
