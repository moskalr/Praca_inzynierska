import DeleteIcon from "@mui/icons-material/Delete";
import { IconButton } from "@mui/material";
import { useTranslation } from "next-i18next";
import { useState } from "react";
import { HTTP_OK } from "../../../constants/httpCodes";
import { HTTP_PATCH } from "../../../constants/httpMethods";
import fetchWithAuthorization from "../../../utils/axios/fetchWrapper";
import snackbar from "../../../utils/snackbar/snackbar";
import LoadingState from "../../../utils/loading_spinner/LoadingSpinner";

const dictionary = "private_fridge";

interface Props {
  accountTag: string | null;
  account: PrivateFridgeAccountListData;
  setIsDeleteFormOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

function DeleteUserFromFridge({
  accountTag,
  account,
  setIsDeleteFormOpen,
}: Props) {
  const { t } = useTranslation(dictionary);

  const [loadingState, setLoadingState] = useState(false);

  const fetchDeleteUser = async () => {
    try {
      const requestOptions = {
        body: JSON.stringify({
          role: account.role,
          enabled: false,
        }),
        headers: {
          "If-Match": accountTag,
        },
      };

      const response = await fetchWithAuthorization(
        `/api/private-fridge/fridges-accounts/${account.id}`,
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

  const deleteUserFromFridge = async () => {
    setLoadingState(true);
    await fetchDeleteUser();
    setIsDeleteFormOpen(false);
    setLoadingState(false);
  };

  return (
    <>
      <LoadingState open={loadingState} />
      <IconButton
        aria-label="expand row"
        size="small"
        onClick={() => deleteUserFromFridge()}
      >
        <DeleteIcon />
      </IconButton>
    </>
  );
}

export default DeleteUserFromFridge;
