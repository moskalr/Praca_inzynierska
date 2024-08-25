import AddIcon from "@mui/icons-material/Add";
import {
  Button,
  ButtonBase,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Typography,
} from "@mui/material";
import { useTranslation } from "next-i18next";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import styles from "~/styles/private_fridge.module.css";
import { HTTP_OK } from "../../constants/httpCodes";
import { HTTP_POST } from "../../constants/httpMethods";
import fetchWithAuthorization from "../../utils/axios/fetchWrapper";
import LoadingState from "../../utils/loading_spinner/LoadingSpinner";
import snackbar from "../../utils/snackbar/snackbar";
import CustomTextField from "./useFrom/CustomTextField";
import { validation } from "./validation/Validation";

const dictionary = "private_fridge";

function CreatePrivateFridge({
  handleUpdateFridgeList,
}: {
  handleUpdateFridgeList(): void;
}) {
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
      title: "",
      description: "",
    },
  });

  const onSubmit = (data: any) => {
    fetchCreatePrivateFridge(data);
  };

  const fetchCreatePrivateFridge = async (data: any) => {
    try {
      const requestOptions = {
        body: JSON.stringify({
          data,
        }),
      };

      const response = await fetchWithAuthorization(
        `/api/private-fridge/fridges/fridge`,
        HTTP_POST,
        requestOptions
      );
      if (response.status === HTTP_OK) {
        const data = await response.json();
        snackbar("success_message.private_fridge_create", "success", t);
        handleUpdateFridgeList();
        setIsFormOpen(false);
        reset();
      } else {
        snackbar("error_message.private_fridge_create_error", "error", t);
      }
    } catch (error) {
      snackbar("error_message.private_fridge_create_error", "error", t);
    }
  };

  return (
    <>
      <ButtonBase
        component="div"
        onClick={() => setIsFormOpen(!isFormOpen)}
        className={styles["create-fridge-button"]}
      >
        <Typography
          variant="h6"
          className={styles["create-fridge-button-text"]}
        >
          {t("create_private_fridge.button_title")}
        </Typography>
        <AddIcon className={styles["create-fridge-button-icon"]} />
      </ButtonBase>
      {isFormOpen && (
        <>
          <LoadingState open={isSubmitting} />
          <Dialog open={isFormOpen} onClose={() => setIsFormOpen(false)}>
            <DialogTitle>
              {t("create_private_fridge.button_title")}{" "}
              <DialogContentText>
                {t("create_private_fridge.form_description_content")}
              </DialogContentText>
            </DialogTitle>
            <form onSubmit={handleSubmit(onSubmit)}>
              <DialogContent>
                <Controller
                  name="title"
                  control={control}
                  rules={formValidation.fridge.title}
                  render={({ field, fieldState }) => (
                    <CustomTextField
                      label={t("create_private_fridge.fridge_title")}
                      type="text"
                      fullWidth
                      required
                      field={field}
                      fieldState={fieldState}
                    />
                  )}
                />
                <Controller
                  name="description"
                  control={control}
                  rules={formValidation.fridge.description}
                  render={({ field, fieldState }) => (
                    <CustomTextField
                      label={t("create_private_fridge.fridge_description")}
                      type="text"
                      fullWidth
                      required
                      field={field}
                      fieldState={fieldState}
                    />
                  )}
                />
              </DialogContent>
              <DialogActions className={styles["dialog-action"]}>
                <Button onClick={() => reset()}>
                  {t("create_private_fridge.clear")}
                </Button>
                <Button onClick={() => setIsFormOpen(false)}>
                  {t("create_private_fridge.cancel")}
                </Button>
                <Button type="submit">
                  {t("create_private_fridge.create")}
                </Button>
              </DialogActions>
            </form>
          </Dialog>
        </>
      )}
    </>
  );
}

export default CreatePrivateFridge;
