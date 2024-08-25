import {
  Box,
  Button,
  Container,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  Typography,
} from "@mui/material";
import isEmpty from "lodash/isEmpty";
import { useRouter } from "next/router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { accent } from "../../../constants/colors";
import { eaaDictionary } from "../../../constants/dictionary";
import { HTTP_POST } from "../../../constants/httpMethods";
import { ReservationMZWO } from "../../../type/mzwo";
import fetchWithAuthorization from "../../../utils/axios/fetchWrapper";
import LoadingState from "../../../utils/loading_spinner/LoadingSpinner";
import snackbar from "../../../utils/snackbar/snackbar";
import SliderComponent from "../Slider";
import CustomReservationButton from "../buttons/CustomButton";
import { useSliderChange } from "../hook/useSliderChange";
import ReservationDetails from "./ReservationDetails";

interface EventReservationProps {
  maxReservationQuantity: number;
  responseReservation?: ReservationMZWO;
  reservationTag?: string;
  onReservationUpdate: () => void;
}

function EventReservation({
  maxReservationQuantity,
  responseReservation,
  reservationTag,
  onReservationUpdate,
}: EventReservationProps) {
  const [reservation, setReservation] = useState<ReservationMZWO | undefined>(
    responseReservation
  );
  const router = useRouter();
  const { t } = useTranslation(eaaDictionary);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { sliderValue, handleSliderChange } = useSliderChange(
    maxReservationQuantity
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const id = router.query.id;

  const handleCreateReservation = async () => {
    try {
      const requestOptions = {
        body: JSON.stringify({
          eventId: id,
          quantity: sliderValue,
        }),
      };

      const response = await fetchWithAuthorization(
        `/api/events-announcements/events/reservations/${id}`,
        HTTP_POST,
        requestOptions
      );

      const data = await response.json();
      if (response.ok) {
        setReservation(data.reservation);
        snackbar("snackbar.successMessage.reservationCreate", "success", t);
        setIsSubmitting(false);
        handleDialogOpen();
        return;
      } else if (data.key !== undefined) {
        snackbar(data.key, "error", t);
      } else {
        snackbar("snackbar.errorMessage.reservationCreate", "error", t);
      }
      setIsSubmitting(false);
    } catch (error) {
      snackbar("snackbar.errorMessage.default", "error", t);
      setIsSubmitting(false);
    }
  };

  const handleReservationUpdate = (updatedReservation: ReservationMZWO) => {
    setReservation(updatedReservation);
    onReservationUpdate();
  };

  const handleDialogOpen = () => {
    setIsDialogOpen((prev) => !prev);
  };

  const submitReservation = async () => {
    setIsSubmitting(true);
    await handleCreateReservation();
  };

  return (
    <Container>
      {!isEmpty(reservation) && (
        <ReservationDetails
          reservationMZWO={reservation}
          maxReservationQuantity={maxReservationQuantity}
          handleReservationUpdate={handleReservationUpdate}
          reservationTag={reservationTag}
        />
      )}
      {isEmpty(reservation) && (
        <Grid>
          <Typography variant="subtitle2">
            {t("events.reservations.notFound")}
          </Typography>
          <Typography>
            <Button onClick={handleDialogOpen} sx={{ color: accent }}>
              {t("events.reservations.create")}
            </Button>
          </Typography>
        </Grid>
      )}
      <Dialog open={isDialogOpen} onClose={handleDialogOpen}>
        <DialogTitle>
          {t("events.reservations.quantityDialogTitle")}
        </DialogTitle>
        <DialogContent>
          {t("events.reservations.setQuantity")} {sliderValue}
        </DialogContent>
        <DialogContent>
          <Grid sx={{ marginTop: "1vh" }}>
            <SliderComponent
              sliderValue={sliderValue}
              handleSliderChange={handleSliderChange}
              maxReservationQuantity={maxReservationQuantity}
            />
          </Grid>
          <Box display="flex" justifyContent="flex-end">
            <CustomReservationButton
              label={t("events.dialog.cancel")}
              action={handleDialogOpen}
            />
            <CustomReservationButton
              label={t("events.dialog.submit")}
              action={submitReservation}
            />
          </Box>
        </DialogContent>
        <LoadingState open={isSubmitting} />
      </Dialog>
    </Container>
  );
}

export default EventReservation;
