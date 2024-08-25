import ModeEditRoundedIcon from "@mui/icons-material/ModeEditRounded";
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { useRouter } from "next/router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { eaaDictionary } from "../../../constants/dictionary";
import { HTTP_PATCH, HTTP_PUT } from "../../../constants/httpMethods";
import { ReservationMZWO } from "../../../type/mzwo";
import fetchWithAuthorization from "../../../utils/axios/fetchWrapper";
import { formatDate, formatTime } from "../../../utils/date/date";
import LoadingState from "../../../utils/loading_spinner/LoadingSpinner";
import snackbar from "../../../utils/snackbar/snackbar";
import SliderComponent from "../Slider";
import CustomReservationButton from "../buttons/CustomButton";
import { useSliderChange } from "../hook/useSliderChange";

interface ReservationDetailsProps {
  reservationMZWO: ReservationMZWO;
  maxReservationQuantity: number;
  handleReservationUpdate: (updatedReservation: ReservationMZWO) => void;
  reservationTag?: string;
}

function ReservationDetails({
  reservationMZWO,
  maxReservationQuantity,
  handleReservationUpdate,
  reservationTag,
}: ReservationDetailsProps) {
  const { t } = useTranslation(eaaDictionary);
  const [editMode, setEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { sliderValue, handleSliderChange } = useSliderChange(
    reservationMZWO.quantity
  );
  const formattedCreationDate = formatDate(reservationMZWO.createdAt);
  const formattedModificationDate = formatDate(reservationMZWO.lastModifiedAt);
  const formattedCreationTime = formatTime(reservationMZWO.createdAt);
  const formattedModificationTime = formatTime(reservationMZWO.lastModifiedAt);
  const id = router.query.id;
  const handleEdit = () => {
    setEditMode((prev) => !prev);
  };

  const handleEditReservation = async () => {
    try {
      const requestOptions = {
        body: JSON.stringify({
          reservationId: reservationMZWO.id,
          newQuantity: sliderValue,
          reservationState: reservationMZWO.reservationState,
        }),
        headers: {
          "If-Match": reservationTag,
        },
      };
      const response = await fetchWithAuthorization(
        `/api/events-announcements/events/reservations/${id}`,
        HTTP_PATCH,
        requestOptions
      );
      const data = await response.json();
      if (response.ok) {
        handleReservationUpdate(data.reservation);
        snackbar("snackbar.successMessage.reservationUpdate", "success", t);
        setIsLoading(false);
        handleEdit();
        return;
      } else if (data.key !== undefined) {
        snackbar(data.key, "error", t);
      } else {
        snackbar("snackbar.errorMessage.reservationUpdate", "error", t);
      }
      setIsLoading(false);
    } catch (error) {
      snackbar("snackbar.errorMessage.default", "error", t);
      setIsLoading(false);
    }
  };

  const handleCancelReservation = async () => {
    try {
      const requestOptions = {
        body: JSON.stringify({
          reservationId: reservationMZWO.id,
        }),
        headers: {
          "If-Match": reservationTag,
        },
      };

      const response = await fetchWithAuthorization(
        `/api/events-announcements/events/reservations/${id}`,
        HTTP_PUT,
        requestOptions
      );

      const data = await response.json();
      if (response.ok) {
        handleReservationUpdate(data.reservation);
        snackbar("snackbar.successMessage.reservationCancel", "success", t);
        return;
      } else if (data.key !== undefined) {
        snackbar(data.key, "error", t);
      } else {
        snackbar("snackbar.errorMessage.reservationCancel", "error", t);
      }
      setIsLoading(false);
    } catch (error) {
      snackbar("snackbar.errorMessage.default", "error", t);
      setIsLoading(false);
    }
  };

  const submitReservationChange = async () => {
    setIsLoading(true);
    await handleEditReservation();
  };

  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>{t("events.reservations.my")}</TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell>{t("objectDetails.id")}</TableCell>
            <TableCell>{reservationMZWO.id}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>{t("objectDetails.creator")}</TableCell>
            <TableCell>{reservationMZWO.creator}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>{t("objectDetails.lastModifiedBy")}</TableCell>
            <TableCell>{reservationMZWO.lastModifiedBy}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>{t("objectDetails.createdAt")}</TableCell>
            <TableCell>
              {formattedCreationDate} {formattedCreationTime}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>{t("objectDetails.lastModifiedAt")}</TableCell>
            <TableCell>
              {formattedModificationDate} {formattedModificationTime}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>{t("events.reservations.quantity")}</TableCell>
            <TableCell>{reservationMZWO.quantity}</TableCell>
          </TableRow>
          <TableRow
            sx={{
              backgroundColor:
                reservationMZWO.reservationState === "ACTIVE" ? "green" : "red",
            }}
          >
            <TableCell>{t("events.reservations.reservationState")}</TableCell>
            <TableCell>{reservationMZWO.reservationState}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>
              <Button
                sx={{
                  mt: "1vh",
                  color: "secondary.main",
                  "&:hover": {
                    color: "white",
                    backgroundColor: "secondary.main",
                  },
                }}
                onClick={handleEdit}
                startIcon={<ModeEditRoundedIcon />}
              >
                {t("events.reservations.edit")}
              </Button>
            </TableCell>
            <TableCell>
              <CustomReservationButton
                label={t("events.reservations.cancel")}
                action={handleCancelReservation}
              />
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
      <Dialog
        open={editMode}
        onClose={handleEdit}
        sx={{ width: "80%", maxWidth: "800px" }}
      >
        <DialogTitle>
          {t("events.reservations.quantityChangeDialogTitle")}
        </DialogTitle>
        <DialogContent>{t("events.reservations.setNewQuantity")}</DialogContent>
        <DialogContent>
          <Box sx={{ marginTop: "1vh" }}>
            <SliderComponent
              sliderValue={sliderValue}
              handleSliderChange={handleSliderChange}
              maxReservationQuantity={maxReservationQuantity}
            />
          </Box>
          <Box display="flex" justifyContent="flex-end">
            <CustomReservationButton
              label={t("events.dialog.cancel")}
              action={handleEdit}
            />
            <CustomReservationButton
              label={t("events.dialog.submit")}
              action={submitReservationChange}
            />
          </Box>
        </DialogContent>
        <LoadingState open={isLoading} />
      </Dialog>
    </TableContainer>
  );
}

export default ReservationDetails;
