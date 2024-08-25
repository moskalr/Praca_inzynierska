import { enqueueSnackbar } from "notistack";

type SnackbarVariant = "error" | "success";

export const snackbarTranslated = (
  message: string,
  variant: SnackbarVariant
) => {
  enqueueSnackbar(message, {
    variant,
  });
};

export default snackbarTranslated;
