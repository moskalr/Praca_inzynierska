import SettingsIcon from "@mui/icons-material/Settings";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Typography,
} from "@mui/material";
import { useTranslation } from "next-i18next";
import { useState } from "react";
import { secondary } from "../../../constants/colors";
import { HTTP_OK } from "../../../constants/httpCodes";
import { HTTP_GET, HTTP_PATCH } from "../../../constants/httpMethods";
import { CANCELED } from "../../../constants/invitationStatus";
import fetchWithAuthorization from "../../../utils/axios/fetchWrapper";
import LoadingState from "../../../utils/loading_spinner/LoadingSpinner";
import snackbar from "../../../utils/snackbar/snackbar";

const dictionary = "private_fridge";

interface Props {
  invitation: PrivateFridgeInvitationData;
}

function CancelInvitation({ invitation }: Props) {
  const { t } = useTranslation(dictionary);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [invitationTag, setInvitationTag] = useState<string | null>(null);

  const cancelInvitatione = async () => {
    setIsLoading(true);
    await fetchCancelInvitation();
    setIsFormOpen(false);
    setIsLoading(false);
  };

  const handleOpenDialog = async () => {
    setIsLoading(true);
    await getInvitationForEtag();
  };

  const getInvitationForEtag = async () => {
    try {
      const response = await fetchWithAuthorization(
        `/api/private-fridge/invitations/${invitation.id}`,
        HTTP_GET
      );

      const data = await response.json();
      if (response.ok) {
        setInvitationTag(data.etag);
        setIsFormOpen(true);
        setIsLoading(false);
        return;
      } else if (data.key !== undefined) {
        snackbar(data.key, "error", t);
        setIsLoading(false);
      }
    } catch (error) {
      snackbar("snackbar.errorMessage.default", "error", t);
      setIsLoading(false);
    }
  };

  const fetchCancelInvitation = async () => {
    try {
      const requestOptions = {
        body: JSON.stringify({
          status: CANCELED,
        }),
        headers: {
          "If-Match": invitationTag,
        },
      };

      const response = await fetchWithAuthorization(
        `/api/private-fridge/invitations/${invitation.id}`,
        HTTP_PATCH,
        requestOptions
      );
      if (response.status === HTTP_OK) {
        snackbar("success_message.private_fridge_create", "success", t);
      } else {
        snackbar("error_message.private_fridge_create_error", "error", t);
      }
    } catch (error) {
      snackbar("error_message.private_fridge_create_error", "error", t);
    }
  };

  return (
    <>
      <LoadingState open={isLoading} />
      <IconButton
        aria-label="expand row"
        size="small"
        onClick={() => handleOpenDialog()}
      >
        <SettingsIcon />
      </IconButton>
      <Dialog open={isFormOpen} onClose={() => setIsFormOpen(false)}>
        <DialogTitle>
          {t("create_private_fridge.cancel_invitation")}
        </DialogTitle>
        <DialogContentText
          style={{
            marginLeft: "20px",
          }}
        >
          {t("invitation.cancel_description")}
        </DialogContentText>
        <DialogContent
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <Typography sx={{ marginRight: "20px" }}>
            <b>{t("private_fridge.username")}: </b>
            {invitation.receiver.username}
          </Typography>
          <Typography>
            <b>{t("private_fridge.role")}: </b>
            {t(`private_fridge.roles.${invitation.role}`.toLowerCase())}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setIsFormOpen(false)}
            style={{ color: secondary }}
          >
            {t("create_private_fridge.cancel")}
          </Button>
          <Button
            onClick={() => cancelInvitatione()}
            style={{ color: secondary }}
          >
            {t("create_private_fridge.cancel_invitation")}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default CancelInvitation;
