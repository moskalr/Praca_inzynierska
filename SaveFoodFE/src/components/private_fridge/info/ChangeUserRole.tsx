import SettingsIcon from "@mui/icons-material/Settings";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  Typography,
} from "@mui/material";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import { useTranslation } from "next-i18next";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { HTTP_OK } from "../../../constants/httpCodes";
import { HTTP_GET, HTTP_PATCH } from "../../../constants/httpMethods";
import { roles } from "../../../constants/privateFridgeRoles";
import styles from "~/styles/private_fridge.module.css";
import fetchWithAuthorization from "../../../utils/axios/fetchWrapper";
import { outlinedInputStyles } from "../../../utils/custom_mui_style/style";
import snackbar from "../../../utils/snackbar/snackbar";
import LoadingState from "../../../utils/loading_spinner/LoadingSpinner";
import { validation } from "../validation/Validation";
import DeleteUserFromFridge from "./DeleteUserFromFridge";

const dictionary = "private_fridge";

interface Props {
  account: PrivateFridgeAccountListData;
}

function ChangeUserRole({ account }: Props) {
  const { t } = useTranslation(dictionary);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [accountTag, setAccountTag] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const formValidation = validation(t);

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm({
    defaultValues: account,
  });

  const handleFormOpen = async () => {
    await getAccountEtag();
  };

  const onSubmit = async (data: any) => {
    await fetchChangeUserRole(data);
    setIsFormOpen(false);
  };

  const getAccountEtag = async () => {
    try {
      const response = await fetchWithAuthorization(
        `/api/private-fridge/fridges-accounts/${account.id}`,
        HTTP_GET
      );

      const data = await response.json();
      if (response.ok) {
        setAccountTag(data.etag);
        setIsLoading(false);
        setIsFormOpen(true);
        return;
      } else if (data.key !== undefined) {
        snackbar(data.key, "error", t);
      }
    } catch (error) {
      snackbar("snackbar.errorMessage.default", "error", t);
    }
  };

  const fetchChangeUserRole = async (formData: any) => {
    try {
      const requestOptions = {
        body: JSON.stringify({
          role: formData.role,
          enabled: formData.enabled,
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

  return (
    <>
      <LoadingState open={isSubmitting || isLoading} />
      <IconButton
        aria-label="expand row"
        size="small"
        onClick={() => handleFormOpen()}
      >
        <SettingsIcon />
      </IconButton>
      <Dialog open={isFormOpen} onClose={() => setIsFormOpen(false)}>
        <DialogTitle>{t("private_fridge.edit_user")}</DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <Typography sx={{ marginRight: "20px" }}>
              <b>{t("private_fridge.username")}: </b>
              {account.account.username}
            </Typography>
            <FormControl sx={outlinedInputStyles}>
              <InputLabel color="secondary">
                {t("private_fridge.role")}
              </InputLabel>
              <Controller
                name="role"
                control={control}
                render={({ field, fieldState }) => (
                  <Select
                    label={t("private_fridge.role")}
                    sx={{ width: "150px" }}
                    {...field}
                    error={!!fieldState.error}
                  >
                    {roles.map((role) => (
                      <MenuItem value={role.value}>
                        {t(`private_fridge.roles.${role.key}`)}
                      </MenuItem>
                    ))}
                  </Select>
                )}
              />
            </FormControl>
            <DeleteUserFromFridge
              accountTag={accountTag}
              account={account}
              setIsDeleteFormOpen={setIsFormOpen}
            />
          </DialogContent>
          <DialogActions className={styles["dialog-action"]}>
            <Button onClick={() => setIsFormOpen(false)}>
              {t("create_private_fridge.cancel")}
            </Button>
            <Button onClick={() => reset()}>
              {t("create_private_fridge.undo")}
            </Button>
            <Button type="submit">
              {t("create_private_fridge.change_role")}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  );
}

export default ChangeUserRole;
