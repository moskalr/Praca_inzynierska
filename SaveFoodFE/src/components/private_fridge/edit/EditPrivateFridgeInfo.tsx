import {
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import { useTranslation } from "next-i18next";
import { Controller, useForm } from "react-hook-form";
import { HTTP_OK } from "../../../constants/httpCodes";
import { HTTP_PATCH } from "../../../constants/httpMethods";
import styles from "~/styles/private_fridge.module.css";
import fetchWithAuthorization from "../../../utils/axios/fetchWrapper";
import snackbar from "../../../utils/snackbar/snackbar";
import LoadingState from "../../../utils/loading_spinner/LoadingSpinner";
import CustomTextField from "../useFrom/CustomTextField";
import { validation } from "../validation/Validation";
import ArchivePrivateFridge from "./ArchivePrivateFridge";

const dictionary = "private_fridge";

interface Props {
  fridgeTag: string | null;
  fridge: PrivateFridgeInfoData;
  handleFridgeUpdate(newFridgeData: any): void;
  handleCloseDialog(): void;
}

function EditPrivateFridgeInfo({
  fridgeTag,
  fridge,
  handleFridgeUpdate,
  handleCloseDialog,
}: Props) {
  const { t } = useTranslation(dictionary);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { isSubmitting },
  } = useForm({
    defaultValues: {
      title: fridge.title,
      description: fridge.description,
      archived: fridge.archived,
    },
  });
  const formValidation = validation(t);

  const onSubmit = async (data: any) => {
    if (fridge.description != data.description || fridge.title != data.title) {
      await patchPrivateFridge(data);
    }
  };

  const clearForm = () => {
    setValue("title", "");
    setValue("description", "");
  };

  const cancelForm = () => {
    reset();
    handleCloseDialog();
  };

  const patchPrivateFridge = async (formData: any) => {
    try {
      const requestOptions = {
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          isArchived: formData.archived,
        }),
        headers: {
          "If-Match": fridgeTag,
        },
      };

      const response = await fetchWithAuthorization(
        `/api/private-fridge/fridges/${fridge.id}`,
        HTTP_PATCH,
        requestOptions
      );

      if (response.status === HTTP_OK) {
        const data: PrivateFridgeInfoData = await response.json();
        snackbar("success_message.private_fridge_create", "success", t);
        handleFridgeUpdate(formData);
      } else {
        snackbar("error_message.private_fridge_create_error", "error", t);
      }
    } catch (error) {
      snackbar("error_message.private_fridge_create_error", "error", t);
    }
  };

  return (
    <>
      <LoadingState open={isSubmitting} />
      <DialogTitle>{t("edit_fridge.dialog_title")}</DialogTitle>
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
          <ArchivePrivateFridge
            fridge={fridge}
            patchPrivateFridge={patchPrivateFridge}
          />
        </DialogContent>
        <DialogActions className={styles["dialog-action"]}>
          <Button onClick={() => clearForm()}>
            {t("create_private_fridge.clear")}
          </Button>
          <Button onClick={() => cancelForm()}>
            {t("create_private_fridge.cancel")}
          </Button>
          <Button disabled={fridge.archived} type="submit">
            {t("edit_fridge.edit")}
          </Button>
        </DialogActions>
      </form>
    </>
  );
}

export default EditPrivateFridgeInfo;
