import {
  Button,
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { eaaDictionary } from "../../../constants/dictionary";
import { HTTP_GET, HTTP_PATCH } from "../../../constants/httpMethods";
import { ReservationMZWO } from "../../../type/mzwo";
import fetchWithAuthorization from "../../../utils/axios/fetchWrapper";
import { formatDateToDisplay } from "../../../utils/date/date";
import snackbar from "../../../utils/snackbar/snackbar";
import ConfirmationDialog from "../../confirm/ConfirmationDialog";

function EventReservations() {
  const [reservations, setReservations] = useState<ReservationMZWO[]>();
  const router = useRouter();
  const { t } = useTranslation(eaaDictionary);
  const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const id = router.query.id;

  const handleConfirmationDialogOpen = () => {
    setConfirmationDialogOpen((prev) => !prev);
  };

  const fetchReservations = async () => {
    try {
      const response = await fetchWithAuthorization(
        `/api/events-announcements/events/reservations/${id}`,
        HTTP_GET
      );

      if (response.ok) {
        const data = await response.json();
        setReservations(data.reservations);
        return;
      }
      snackbar("snackbar.errorMessage.default", "error", t);
    } catch (error) {
      snackbar("snackbar.errorMessage.default", "error", t);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, [router.query.id]);

  const handleConfirmClaim = async (
    reservationId: number,
    newQuantity: number
  ) => {
    try {
      const requestOptions = {
        body: JSON.stringify({
          reservationId: reservationId,
          newQuantity: newQuantity,
          reservationState: "CLAIMED",
        }),
      };

      const response = await fetchWithAuthorization(
        `/api/events-announcements/events/reservations/${reservationId}`,
        HTTP_PATCH,
        requestOptions
      );

      const data = await response.json();
      if (response.ok) {
        snackbar("snackbar.successMessage.reservationClaim", "success", t);
      } else if (data.key !== undefined) {
        snackbar(data.key, "error", t);
      } else {
        snackbar("snackbar.successMessage.reservationClaim", "success", t);
      }
      setIsLoading(false);
    } catch (error) {
      snackbar("snackbar.errorMessage.default", "error", t);
      setIsLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="lg">
      <Paper
        elevation={3}
        style={{
          borderRadius: "20px",
          padding: "16px",
        }}
      >
        <TableContainer component={Paper}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ backgroundColor: "primary.main" }}>
                  {t("Id")}
                </TableCell>
                <TableCell sx={{ backgroundColor: "primary.main" }}>
                  {t("account.firstName")}
                </TableCell>
                <TableCell sx={{ backgroundColor: "primary.main" }}>
                  {t("account.lastName")}
                </TableCell>
                <TableCell sx={{ backgroundColor: "primary.main" }}>
                  {t("events.reservations.quantity")}
                </TableCell>
                <TableCell sx={{ backgroundColor: "primary.main" }}>
                  {t("events.reservations.foodUnit")}
                </TableCell>
                <TableCell sx={{ backgroundColor: "primary.main" }}>
                  {t("events.reservations.reservationState")}
                </TableCell>
                <TableCell sx={{ backgroundColor: "primary.main" }}>
                  {t("objectDetails.createdAt")}
                </TableCell>
                <TableCell sx={{ backgroundColor: "primary.main" }}>
                  {t("events.reservations.claim")}
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reservations &&
                reservations?.length !== 0 &&
                reservations.map((reservation: ReservationMZWO) => (
                  <TableRow
                    key={reservation.id}
                    sx={{
                      borderColor:
                        reservation.reservationState === "CLAIMED"
                          ? "green"
                          : "transparent",
                      borderWidth: 1,
                      border: "solid",
                    }}
                  >
                    <TableCell>{reservation.id}</TableCell>
                    <TableCell>{reservation.account.firstName}</TableCell>
                    <TableCell>{reservation.account.lastName}</TableCell>
                    <TableCell>{reservation.quantity}</TableCell>
                    <TableCell>
                      {t(`units2.${reservation.event.foodUnit.toLowerCase()}s`)}
                    </TableCell>
                    <TableCell>
                      {t(
                        `states.${reservation.reservationState.toLowerCase()}`
                      )}
                    </TableCell>
                    <TableCell>
                      {formatDateToDisplay(reservation.createdAt)}
                    </TableCell>
                    <TableCell>
                      {reservation.reservationState !== "CLAIMED" &&
                      reservation.reservationState !== "ARCHIVED" ? (
                        <Button
                          variant="contained"
                          onClick={handleConfirmationDialogOpen}
                        >
                          {t("events.reservations.claim")}
                        </Button>
                      ) : (
                        formatDateToDisplay(reservation.lastModifiedAt)
                      )}
                    </TableCell>
                    <ConfirmationDialog
                      isOpen={confirmationDialogOpen}
                      onClose={handleConfirmationDialogOpen}
                      onConfirm={() =>
                        handleConfirmClaim(reservation.id, reservation.quantity)
                      }
                      message={""}
                      t={t}
                    />
                  </TableRow>
                ))}
              {(!reservations || reservations.length === 0) && (
                <TableRow>
                  <TableCell colSpan={6}>
                    {t("events.reservations.noReservations")}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Container>
  );
}

export default EventReservations;
