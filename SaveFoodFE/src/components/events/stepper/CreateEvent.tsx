import ArrowForwardIosRoundedIcon from "@mui/icons-material/ArrowForwardIosRounded";
import {
  Button,
  Container,
  Grid,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import dayjs from "dayjs";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { accent } from "../../../constants/colors";
import { eaaDictionary } from "../../../constants/dictionary";
import { units } from "../../../constants/units";
import { CreateEventMZWO } from "../../../type/mzwo";
import {
  formatDateToDisplay,
  formatLocalDateTime,
} from "../../../utils/date/date";
import { EaaFormsValidation } from "../../../utils/validation/EaaFormsValidation";
import EventDateTimePickerDialog from "../date/EventDateTimePickerDialog";
import { useDateRange } from "../hook/useDateRange";

const textFieldVariant = "outlined";

const inputStyle = {
  "& label.Mui-focused": {
    color: accent,
  },
} as const;

interface CreateEventFormProps {
  createdEvent: CreateEventMZWO;
  handleNext: () => void;
  handleFormOpen: () => void;
  handleCreateEventDetails: (createdEvent: CreateEventMZWO) => void;
}

interface EventFormData {
  title: string;
  content: string;
  foodUnit: string;
  foodQuantity: number;
  maxParticipants: number;
  maxReservationQuantity: number;
}

function CreateEventForm({
  createdEvent,
  handleNext,
  handleCreateEventDetails,
}: CreateEventFormProps) {
  const { t } = useTranslation(eaaDictionary);
  const {
    selectedStartDateTime,
    selectedEndDateTime,
    handleStartDateChange,
    handleEndDateChange,
  } = useDateRange(createdEvent);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EventFormData>();
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const validationRules = EaaFormsValidation(t);
  const handleIsDatePickerOpen = () => {
    setIsDatePickerOpen((prev) => !prev);
  };

  const onSubmit = async (data: EventFormData) => {
    handleCreateEventDetails({
      ...createdEvent,
      ...data,
      startDate:
        selectedStartDateTime !== null
          ? formatLocalDateTime(selectedStartDateTime.toLocaleString())
          : createdEvent.startDate,
      endDate:
        selectedEndDateTime !== null
          ? formatLocalDateTime(selectedEndDateTime.toLocaleString())
          : createdEvent.endDate,
    });
    handleNext();
  };

  return (
    <Container sx={{ marginTop: "1vh", overflow: "auto" }}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack direction="column" justifyContent="space-between" spacing={2}>
          <TextField
            type="text"
            fullWidth
            variant={textFieldVariant}
            defaultValue={createdEvent.title}
            {...register("title", { ...validationRules.eventTitle })}
            label={t("events.fields.title") + " *"}
            size="small"
            error={!!errors.title}
            helperText={errors.title && errors.title.message}
            sx={{ marginTop: "50vh" }}
            InputProps={{
              style: inputStyle as React.CSSProperties,
            }}
          />
          <Typography onClick={handleIsDatePickerOpen}>
            <Grid container xs={12} justifyContent="space-between">
              <Grid item xs={5.8}>
                <TextField
                  type="text"
                  variant={textFieldVariant}
                  value={
                    createdEvent.startDate === ""
                      ? formatDateToDisplay(
                          dayjs().add(5, "minutes").toLocaleString()
                        )
                      : formatDateToDisplay(createdEvent.startDate)
                  }
                  label={t("events.fields.startDate") + " *"}
                  InputProps={{
                    readOnly: true,
                  }}
                  size="small"
                  fullWidth
                />
              </Grid>
              <Grid item xs={5.8}>
                <TextField
                  type="text"
                  variant={textFieldVariant}
                  value={
                    createdEvent.endDate === ""
                      ? formatDateToDisplay(
                          dayjs().add(20, "minutes").toLocaleString()
                        )
                      : formatDateToDisplay(createdEvent.endDate)
                  }
                  label={t("events.fields.endDate") + " *"}
                  InputProps={{
                    readOnly: true,
                  }}
                  size="small"
                  fullWidth
                />
              </Grid>
            </Grid>
          </Typography>
          <TextField
            type="text"
            fullWidth
            variant={textFieldVariant}
            defaultValue={createdEvent.content}
            {...register("content", { ...validationRules.eventContent })}
            label={t("events.fields.content") + " *"}
            size="small"
            multiline
            minRows={2}
            error={!!errors.content}
            helperText={errors.content && errors.content.message}
          />
          <Grid container xs={12} justifyContent="space-between">
            <Grid item xs={5.8}>
              <TextField
                type="numeric"
                fullWidth
                variant={textFieldVariant}
                defaultValue={createdEvent.foodQuantity}
                {...register("foodQuantity", {
                  ...validationRules.foodQuantity,
                })}
                label={t("events.fields.foodQuantity") + " *"}
                size="small"
                error={!!errors.foodQuantity}
                helperText={errors.foodQuantity && errors.foodQuantity.message}
              />
            </Grid>
            <Grid item xs={5.8}>
              <TextField
                select
                fullWidth
                label={t("events.fields.foodUnit") + " *"}
                variant={textFieldVariant}
                defaultValue={createdEvent.foodUnit}
                {...register("foodUnit", { ...validationRules.foodUnit })}
                size="small"
                error={!!errors.foodUnit}
                helperText={errors.foodUnit && errors.foodUnit.message}
              >
                {units.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {t(`units2.${option.value.toLowerCase()}s`)}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
          <Grid container xs={12} justifyContent="space-between">
            <Grid item xs={5.8}>
              <TextField
                type="numeric"
                fullWidth
                variant={textFieldVariant}
                defaultValue={createdEvent.maxReservationQuantity}
                {...register("maxReservationQuantity", {
                  ...validationRules.maxReservationQuantity,
                })}
                label={t("events.fields.maxReservationQuantity") + " *"}
                size="small"
                error={!!errors.maxReservationQuantity}
                helperText={
                  errors.maxReservationQuantity &&
                  errors.maxReservationQuantity.message
                }
              />
            </Grid>
            <Grid item xs={5.8}>
              <TextField
                type="numeric"
                fullWidth
                variant={textFieldVariant}
                defaultValue={createdEvent.maxParticipants}
                {...register("maxParticipants", {
                  ...validationRules.maxParticipants,
                })}
                label={t("events.fields.maxParticipants") + " *"}
                size="small"
                error={!!errors.maxParticipants}
                helperText={
                  errors.maxParticipants && errors.maxParticipants.message
                }
              />
            </Grid>
          </Grid>
          <Grid item xs={12} sx={{ flexGrow: 1 }}>
            <Button
              endIcon={<ArrowForwardIosRoundedIcon />}
              type="submit"
              variant="contained"
              sx={{
                width: "28%",
                right: 0,
                backgroundColor: "secondary.main",
                color: "white",
                float: "right",
                marginBottom: "1vh",
              }}
            >
              {t("events.stepper.next")}
            </Button>
          </Grid>
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
        </Stack>
      </form>
    </Container>
  );
}

export default CreateEventForm;
