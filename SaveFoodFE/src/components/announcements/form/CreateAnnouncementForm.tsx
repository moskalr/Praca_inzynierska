import {
  Button,
  Card,
  CardContent,
  Grid,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { eaaDictionary } from "../../../constants/dictionary";
import { EaaFormsValidation } from "../../../utils/validation/EaaFormsValidation";
import { CreateAnnouncementMZWO } from "../../../type/mzwo";
import fetchWithAuthorization from "../../../utils/axios/fetchWrapper";
import { HTTP_POST } from "../../../constants/httpMethods";
import snackbar from "../../../utils/snackbar/snackbar";
import LoadingState from "../../../utils/loading_spinner/LoadingSpinner";

const textFieldVariant = "outlined";

interface CreateAnnouncementFormProps {
  handleFormOpen: () => void;
  updateAnnouncements: () => void;
}

interface EventFormData {
  title: string;
  content: string;
}

function CreateAnnouncementForm({
  handleFormOpen,
  updateAnnouncements,
}: CreateAnnouncementFormProps) {
  const { t } = useTranslation(eaaDictionary);
  const { register, handleSubmit, formState } = useForm<EventFormData>();
  const validationRules = EaaFormsValidation(t);
  const handleCreateAnnouncement = async (
    createdAnnouncement: CreateAnnouncementMZWO
  ) => {
    try {
      const requestOptions = {
        body: JSON.stringify(createdAnnouncement),
      };

      const response = await fetchWithAuthorization(
        `/api/events-announcements/announcements/createAnnouncement`,
        HTTP_POST,
        requestOptions
      );

      const data = await response.json();
      if (response.ok) {
        snackbar("snackbar.successMessage.announcementCreate", "success", t);
        updateAnnouncements();
        handleFormOpen();
        return;
      } else if (data.key !== undefined) {
        snackbar(data.key, "error", t);
      } else {
        snackbar("snackbar.errorMessage.announcementCreate", "error", t);
      }
    } catch (error) {
      snackbar("snackbar.errorMessage.default", "error", t);
    }
  };

  const onSubmit = async (data: EventFormData) => {
    await handleCreateAnnouncement(data);
  };

  return (
    <Card sx={{ width: "100%", height: "100%" }}>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack direction="column" justifyContent="space-between" spacing={2}>
            <Typography>
              <TextField
                type="text"
                fullWidth
                variant={textFieldVariant}
                {...register("title", { ...validationRules.announcementTitle })}
                label={t("announcements.fields.title") + " *"}
                size="small"
                error={!!formState.errors.title}
                helperText={
                  formState.errors.title && formState.errors.title.message
                }
              />
            </Typography>

            <Typography>
              <TextField
                type="text"
                fullWidth
                variant={textFieldVariant}
                {...register("content", {
                  ...validationRules.announcementContent,
                })}
                label={t("announcements.fields.content") + " *"}
                size="small"
                multiline
                minRows={3}
                error={!!formState.errors.content}
                helperText={
                  formState.errors.content && formState.errors.content.message
                }
              />
            </Typography>

            <Grid item xs={12} sx={{ flexGrow: 1 }}>
              <Button
                type="submit"
                variant="contained"
                sx={{
                  backgroundColor: "secondary.main",
                  color: "primary.main",
                  float: "right",
                }}
              >
                {t("announcements.form.create.submit")}
              </Button>
            </Grid>
          </Stack>
        </form>
      </CardContent>
      <LoadingState open={formState.isSubmitting} />
    </Card>
  );
}

export default CreateAnnouncementForm;
