import PersonAddIcon from "@mui/icons-material/PersonAdd";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
} from "@mui/material";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import { useTranslation } from "next-i18next";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { secondary } from "../../../constants/colors";
import { HTTP_OK, HTTP_UNAUTHORIZED } from "../../../constants/httpCodes";
import { HTTP_POST } from "../../../constants/httpMethods";
import { roles } from "../../../constants/privateFridgeRoles";
import styles from "~/styles/private_fridge.module.css";
import fetchWithAuthorization from "../../../utils/axios/fetchWrapper";
import snackbar from "../../../utils/snackbar/snackbar";
import LoadingState from "../../../utils/loading_spinner/LoadingSpinner";
import CustomTextField from "../useFrom/CustomTextField";
import { validation } from "../validation/Validation";
import { outlinedInputStyles } from "../../../utils/custom_mui_style/style";
import router from "next/router";

const dictionary = "private_fridge";

interface Props {
  fridgeId: number;
}

function AddAccount({ fridgeId }: Props) {
  const { t } = useTranslation(dictionary);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const formValidation = validation(t);

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm({
    defaultValues: {
      username: "",
      role: "",
    },
  });

  const onSubmit = async (data: any) => {
    await sendInvitation(data);
  };

  const sendInvitation = async (formData: any) => {
    const requestOptions = {
      body: JSON.stringify({
        username: formData.username,
        role: formData.role,
        fridgeId: fridgeId,
      }),
    };

    const response = await fetchWithAuthorization(
      `/api/private-fridge/invitations/invitation`,
      HTTP_POST,
      requestOptions
    )
      .then((response) => {
        if (response.status === HTTP_UNAUTHORIZED) {
          snackbar("error_message.unauthorized", "error", t);
          router.push("/login");
        }
        return response.json().then((data) => {
          if (response.ok) {
            snackbar("success_message.send_invitation", "success", t);
            reset();
            setIsFormOpen(false);
          } else if (data.error.key !== undefined) {
            snackbar(`${data.error.key}`, "error", t);
          }
        });
      })
      .catch(() => {
        snackbar("errors.newFridgeError", "error", t);
      });
  };

  return (
    <>
      <LoadingState open={isSubmitting} />
      <IconButton size="small" onClick={() => setIsFormOpen(true)}>
        <PersonAddIcon />
      </IconButton>
      <Dialog open={isFormOpen} onClose={() => setIsFormOpen(false)}>
        <DialogTitle>{t("invitation.sent_title")}</DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent>
            <Controller
              name="username"
              control={control}
              rules={formValidation.account.username}
              render={({ field, fieldState }) => (
                <CustomTextField
                  label={t("private_fridge.username")}
                  type="text"
                  required
                  autoFocus
                  fullWidth
                  field={field}
                  fieldState={fieldState}
                />
              )}
            />
            <FormControl
              className={styles["role-select-form"]}
              sx={outlinedInputStyles}
            >
              <InputLabel style={{ color: secondary }}>
                {t("invitation.role")}
              </InputLabel>
              <Controller
                name="role"
                control={control}
                rules={formValidation.account.role}
                render={({ field, fieldState }) => (
                  <Select
                    label={t("invitation.role")}
                    {...field}
                    error={!!fieldState.error}
                  >
                    {roles.map((role) => (
                      <MenuItem value={role.value} key={role.value}>
                        {t(`private_fridge.roles.${role.key}`)}
                      </MenuItem>
                    ))}
                  </Select>
                )}
              />
            </FormControl>
          </DialogContent>
          <DialogActions className={styles["dialog-action"]}>
            <Button onClick={() => reset()}>
              {t("create_private_fridge.clear")}
            </Button>
            <Button onClick={() => setIsFormOpen(false)}>
              {t("create_private_fridge.cancel")}
            </Button>
            <Button type="submit">{t("invitation.sent")}</Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  );
}

export default AddAccount;
