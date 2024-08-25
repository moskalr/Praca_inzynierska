import {
  Button,
  Card,
  CardContent,
  Grid,
  MenuItem,
  Slider,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { eaaDictionary } from "../../../constants/dictionary";
import { HTTP_PATCH } from "../../../constants/httpMethods";
import { units } from "../../../constants/units";
import { CombinedEvent, EventMZWO } from "../../../type/mzwo";
import fetchWithAuthorization from "../../../utils/axios/fetchWrapper";
import {
  formatDateToDisplay,
  formatLocalDateTime,
} from "../../../utils/date/date";
import LoadingState from "../../../utils/loading_spinner/LoadingSpinner";
import snackbar from "../../../utils/snackbar/snackbar";
import { EaaFormsValidation } from "../../../utils/validation/EaaFormsValidation";
import EventDateTimePickerDialog from "../date/EventDateTimePickerDialog";
import { useDateRange } from "../hook/useDateRange";

const textFieldVariant = "outlined";

interface EditEventFormProps {
  eventMZWO: EventMZWO;
  handleEdit: () => void;
  handleSave: (editedEvent: CombinedEvent) => void;
  eventTag?: string;
  onError: () => void;
}

interface EventFormData {
  title: string;
  content: string;
  foodUnit: string;
  foodQuantity: number;
  maxParticipants: number;
  maxReservationQuantity: number;
}

function EditEventForm({
  eventMZWO,
  handleEdit,
  handleSave,
  eventTag,
  onError,
}: EditEventFormProps) {
  const { t } = useTranslation(eaaDictionary);
  const [editedEvent, setEditedEvent] = useState(eventMZWO);
  const {
    selectedStartDateTime,
    selectedEndDateTime,
    handleStartDateChange,
    handleEndDateChange,
  } = useDateRange(editedEvent);
  const { register, handleSubmit, formState } = useForm<EventFormData>();
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  const validationRules = EaaFormsValidation(t);

  useEffect(() => {
    setEditedEvent(eventMZWO);
  }, [eventMZWO]);

  const handleIsDatePickerOpen = () => {
    setIsDatePickerOpen((prev) => !prev);
  };

  const handleUpdateEvent = async (updatedEvent: EventMZWO) => {
    if (updatedEvent) {
      try {
        const requestOptions = {
          body: JSON.stringify({
            updatedEvent: updatedEvent,
          }),
          headers: {
            "If-Match": eventTag,
          },
        };
        const response = await fetchWithAuthorization(
          `/api/events-announcements/events/patchEvent`,
          HTTP_PATCH,
          requestOptions
        );

        const data = await response.json();
        if (response.ok) {
          snackbar("snackbar.successMessage.eventUpdate", "success", t);
          handleEdit();
          handleSave(data.event);
          return;
        } else if (data.key !== undefined) {
          snackbar(data.key, "error", t);
          onError();
        } else {
          snackbar("snackbar.errorMessage.eventUpdate", "error", t);
        }
      } catch (error) {
        snackbar("snackbar.errorMessage.default", "error", t);
      }
    }
  };

  const onSubmit = async (data: EventFormData) => {
    await handleUpdateEvent({
      ...eventMZWO,
      ...data,
      startDate:
        selectedStartDateTime !== null
          ? formatLocalDateTime(selectedStartDateTime.toLocaleString())
          : editedEvent.startDate,
      endDate:
        selectedEndDateTime !== null
          ? formatLocalDateTime(selectedEndDateTime.toLocaleString())
          : editedEvent.endDate,
    });
  };

  return (
    <Card sx={{ width: "100%", height: "100%" }}>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container direction="column">
            <Typography>
              <TextField
                type="text"
                fullWidth
                variant={textFieldVariant}
                defaultValue={eventMZWO.title}
                {...register("title", { ...validationRules.eventTitle })}
                label={t("events.fields.title") + " *"}
                size="small"
                margin="dense"
                error={!!formState.errors.title}
                helperText={
                  formState.errors.title && formState.errors.title.message
                }
              />
            </Typography>

            <Typography onClick={handleIsDatePickerOpen}>
              <TextField
                type="text"
                fullWidth
                variant={textFieldVariant}
                value={formatDateToDisplay(editedEvent.startDate)}
                label={t("events.fields.startDate") + " *"}
                InputProps={{
                  readOnly: true,
                }}
                size="small"
                margin="dense"
              />

              <TextField
                type="text"
                fullWidth
                variant={textFieldVariant}
                value={formatDateToDisplay(editedEvent.endDate)}
                label={t("events.fields.endDate") + " *"}
                InputProps={{
                  readOnly: true,
                }}
                size="small"
                margin="dense"
                sx={{ color: "secondary.main" }}
              />
            </Typography>

            <Typography>
              <TextField
                type="text"
                fullWidth
                rows={4}
                variant={textFieldVariant}
                defaultValue={eventMZWO.content}
                {...register("content", { ...validationRules.eventContent })}
                label={t("events.fields.content") + " *"}
                size="small"
                multiline
                margin="dense"
                sx={{ color: "secondary.main" }}
                error={!!formState.errors.content}
                helperText={
                  formState.errors.content && formState.errors.content.message
                }
              />
            </Typography>

            <Typography>
              <TextField
                type="numeric"
                variant={textFieldVariant}
                defaultValue={eventMZWO.maxParticipants}
                {...register("maxParticipants", {
                  ...validationRules.maxParticipants,
                })}
                label={t("events.fields.maxParticipants") + " *"}
                size="small"
                margin="dense"
                sx={{ color: "secondary.main" }}
                error={!!formState.errors.maxParticipants}
                helperText={
                  formState.errors.maxParticipants &&
                  formState.errors.maxParticipants.message
                }
              />
            </Typography>

            <Typography>
              <TextField
                type="numeric"
                variant={textFieldVariant}
                defaultValue={eventMZWO.foodQuantity}
                {...register("foodQuantity", {
                  ...validationRules.foodQuantity,
                })}
                label={t("events.fields.foodQuantity") + " *"}
                size="small"
                margin="dense"
                sx={{ color: "secondary.main" }}
                error={!!formState.errors.foodQuantity}
                helperText={
                  formState.errors.foodQuantity &&
                  formState.errors.foodQuantity.message
                }
              />

              <TextField
                select
                label={t("events.fields.foodUnit") + " *"}
                variant={textFieldVariant}
                defaultValue={eventMZWO.foodUnit}
                {...register("foodUnit", { ...validationRules.foodUnit })}
                size="small"
                margin="dense"
                sx={{ color: "secondary.main", marginLeft: "1vw" }}
                error={!!formState.errors.foodUnit}
                helperText={
                  formState.errors.foodUnit && formState.errors.foodUnit.message
                }
              >
                {units.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {t(`units2.${option.value.toLowerCase()}s`)}
                  </MenuItem>
                ))}
              </TextField>
            </Typography>

            <Typography variant="caption">
              {t("events.fields.maxReservationQuantity") + " *"}
              <Stack
                spacing={2}
                direction="row"
                sx={{ mb: 1 }}
                alignItems="center"
              >
                <Typography variant="caption">1</Typography>
                <Slider
                  size="small"
                  defaultValue={editedEvent.maxReservationQuantity}
                  aria-label="Small"
                  valueLabelDisplay="auto"
                  {...register("maxReservationQuantity", {
                    ...validationRules.maxReservationQuantity,
                  })}
                  min={1}
                  max={editedEvent.foodQuantity}
                  sx={{ color: "secondary.main" }}
                />
                <Typography variant="caption">
                  {editedEvent.foodQuantity}
                </Typography>
              </Stack>
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
                {t("events.dialog.submit")}
              </Button>
            </Grid>
          </Grid>
        </form>
        <EventDateTimePickerDialog
          open={isDatePickerOpen}
          onClose={handleIsDatePickerOpen}
          startDate={selectedStartDateTime}
          endDate={selectedEndDateTime}
          onStartDateChange={handleStartDateChange}
          onEndDateChange={handleEndDateChange}
          onAccept={handleIsDatePickerOpen}
          initialValue={t("events.dialog.dateTitle")}
        />
        <LoadingState open={formState.isLoading} />
      </CardContent>
    </Card>
  );
}

export default EditEventForm;
