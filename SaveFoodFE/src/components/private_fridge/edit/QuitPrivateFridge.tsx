import DeleteIcon from "@mui/icons-material/Delete";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Typography,
} from "@mui/material";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import { useState } from "react";
import { HTTP_OK } from "../../../constants/httpCodes";
import { HTTP_GET, HTTP_PATCH } from "../../../constants/httpMethods";
import styles from "~/styles/private_fridge.module.css";
import fetchWithAuthorization from "../../../utils/axios/fetchWrapper";
import snackbar from "../../../utils/snackbar/snackbar";
import LoadingState from "../../../utils/loading_spinner/LoadingSpinner";

const dictionary = "private_fridge";

interface Props {
  accountFridge: PrivateFridgeAccountListData | undefined;
  fridge: PrivateFridgeInfoData;
}

function QuitPrivateFridge({ accountFridge, fridge }: Props) {
  const { t } = useTranslation(dictionary);
  const router = useRouter();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [loadingState, setLoadingState] = useState(false);
  const [accountTag, setAccountTag] = useState<string | null>(null);

  const handleFormOpen = async () => {
    setLoadingState(true);
    await getAccountEtag();
  };

  const quitPrivateFridge = async () => {
    setLoadingState(true);
    await patchFridgeAccountStatus();
    setLoadingState(false);
    setIsFormOpen(false);
  };

  const getAccountEtag = async () => {
    try {
      const response = await fetchWithAuthorization(
        `/api/private-fridge/fridges-accounts/${accountFridge?.id}`,
        HTTP_GET
      );

      const data = await response.json();
      if (response.ok) {
        setAccountTag(data.etag);
        setLoadingState(false);
        setIsFormOpen(true);
        return;
      } else if (data.key !== undefined) {
        snackbar(data.key, "error", t);
        setLoadingState(false);
      }
    } catch (error) {
      snackbar("snackbar.errorMessage.default", "error", t);
      setLoadingState(false);
    }
  };

  const patchFridgeAccountStatus = async () => {
    try {
      const requestOptions = {
        headers: {
          "If-Match": accountTag,
        },
      };

      const queryParams = new URLSearchParams();
      queryParams.append("id", String(fridge.id));

      const response = await fetchWithAuthorization(
        `/api/private-fridge/fridges-accounts/fridge-account?${queryParams.toString()}`,
        HTTP_PATCH,
        requestOptions
      );

      if (response.status === HTTP_OK) {
        const data = await response.json();
        snackbar("success_message.private_fridge_create", "success", t);
        router.push("/private-fridges");
      } else {
        snackbar("error_message.private_fridge_create_error", "error", t);
      }
    } catch (error) {
      snackbar("error_message.private_fridge_create_error", "error", t);
    }
  };

  return (
    <>
      <LoadingState open={loadingState} />
      <Button
        component="div"
        onClick={() => handleFormOpen()}
        className={styles["fridge-button"]}
      >
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          {t("private_fridge.quit")}
        </Typography>
      </Button>
      {isFormOpen && (
        <>
          <Dialog open={isFormOpen} onClose={() => setIsFormOpen(false)}>
            <DialogTitle>{t("archive_fridge.title")}</DialogTitle>
            <DialogContent>
              <DialogContentText>
                {t("archive_fridge.description")}
              </DialogContentText>
            </DialogContent>
            <DialogActions className={styles["dialog-action"]}>
              <Button onClick={() => setIsFormOpen(false)}>
                {t("create_private_fridge.cancel")}
              </Button>
              <Button onClick={() => quitPrivateFridge()}>
                {t("private_fridge.quit")}
                <DeleteIcon />
              </Button>
            </DialogActions>
          </Dialog>
        </>
      )}
    </>
  );
}

export default QuitPrivateFridge;
