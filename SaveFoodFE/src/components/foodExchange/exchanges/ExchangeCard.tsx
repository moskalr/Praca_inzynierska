import EventBusyIcon from "@mui/icons-material/EventBusy";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Grid,
  IconButton,
  Typography,
} from "@mui/material";
import React, { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { UserContext } from "../../../components/context/UserContextProvider";
import { secondary } from "../../../constants/colors";
import { HTTP_GET, HTTP_PATCH } from "../../../constants/httpMethods";
import { foodExchangeUrl } from "../../../constants/url/foodExchange";
import { Exchange, ExchangeState, ExchangeStateType } from "../../../type/mzwz";
import fetchWithAuthorization from "../../../utils/axios/fetchWrapper";
import { formatDate, formatTime } from "../../../utils/date/date";
import snackbarTranslated from "../../../utils/snackbar/snackbarTranslated";
import { CLIENT_ADMIN, CLIENT_USER } from "../../../constants/roles";
import DetailsCardExchange from "../cards/DetailsCardExchange";
import RatingDelivery from "./RatingDeliveryDialog";

const translation = "Tabs.AllExchanges.ExchangeCard.";
const translationRequests = "Tabs.AllExchanges.ExchangeCard.Requests.";
interface ConfrimReceiptDeliveryProps {
  handleConfirmReceipt: (e: React.FormEvent) => void;
  currentRole: string;
  exchange: Exchange;
  t: any;
  index: number;
}
const allowedRoles = [CLIENT_ADMIN, CLIENT_USER];
const allowedStateToCancelReservation = [
  ExchangeState.AWAITING,
  ExchangeState.WAITING_FOR_RESERVED_DELIVERY,
] as ExchangeStateType[];
const ConfrimReceiptDeliveryButton = ({
  handleConfirmReceipt,
  currentRole,
  exchange,
  index,
  t,
}: ConfrimReceiptDeliveryProps) => {
  const allowToConfirmReceipt = () => {
    if (
      exchange.exchangeState === ExchangeState.WAITING_FOR_RECEIPT_PRODUCT &&
      exchange.deliveryId === undefined
    ) {
      return true;
    }
    if (
      exchange.exchangeState === ExchangeState.WAITING_FOR_PENDING_DELIVERIES
    ) {
      return true;
    }
    return false;
  };
  return (
    <>
      {allowedRoles.includes(currentRole) && allowToConfirmReceipt() && (
        <Button onClick={handleConfirmReceipt} variant="contained">
          {t(translation + "confirmReceiptDeliveryButton")}
        </Button>
      )}
    </>
  );
};

interface ExchangeProps {
  exchange: Exchange;
  index: number;
  removeExchangeFromList: (event: React.FormEvent, index: number) => void;
  setUpdatedExchange: (index: number, changedExchange: Exchange) => void;
}

export function ExchangeCard({
  exchange,
  index,
  removeExchangeFromList,
  setUpdatedExchange,
}: ExchangeProps) {
  const [tabValue, setTabValue] = useState(0);
  const [hydrated, setHydrated] = useState(false);
  const { t } = useTranslation("foodExchange");
  const { currentRole } = useContext(UserContext);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const handleOpenRatingDeliveryDialog = () => {
    setIsDialogOpen((prev) => !prev);
  };
  const [isDialogDetailsExchangeOpen, setIsDialogDetailsExchangeOpen] =
    useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  if (!hydrated) {
    return null;
  }
  const allowToCancelReservation = () => {
    if (
      exchange.exchangeState === ExchangeState.WAITING_FOR_RECEIPT_PRODUCT &&
      exchange.deliveryId === undefined
    ) {
      return true;
    }
    if (allowedStateToCancelReservation.includes(exchange.exchangeState)) {
      return true;
    }
    return false;
  };

  const allowShowRateButton = () => {
    if (
      exchange.exchangeState === ExchangeState.COMPLETED &&
      currentRole === CLIENT_USER
    ) {
      return true;
    }
  };
  const fetchExchange = async () => {
    const redExchangeId = exchange.id;

    await fetchWithAuthorization(
      `${foodExchangeUrl}exchange/${redExchangeId}`,
      HTTP_GET
    )
      .then((res: Response) => {
        res
          .json()
          .then((resAxios) => {
            if (res.ok) {
              snackbarTranslated(
                t(translationRequests + "FetchReservation.success"),
                "success"
              );
              setUpdatedExchange(index, resAxios.exchange);
              return;
            }
            if (resAxios.key !== undefined) {
              snackbarTranslated(
                t(
                  translationRequests + "FetchReservation.Error." + resAxios.key
                ),
                "error"
              );
              return;
            }
            throw new Error();
          })
          .catch((error) => {
            snackbarTranslated(
              t(translationRequests + "FetchReservation.Error.general"),
              "error"
            );
          });
      })
      .catch((error) => {
        snackbarTranslated(
          t(translationRequests + "FetchReservation.Error.general"),
          "error"
        );
      });
  };
  const handleDetailsExchangeDialog = () => {
    setIsDialogDetailsExchangeOpen((prev) => !prev);
  };

  const cancelReservation = async (event: React.FormEvent) => {
    event.preventDefault();

    const redExchangeId = exchange.id;
    const path = "exchangeState";

    const requestOptions = {
      body: JSON.stringify({
        value: "AWAITING",
      }),
      headers: {
        "If-Match": exchange.etag,
      },
    };

    await fetchWithAuthorization(
      `${foodExchangeUrl}exchanges/${redExchangeId}/${path}`,
      HTTP_PATCH,
      requestOptions
    )
      .then((res: Response) => {
        res
          .json()
          .then((resAxios) => {
            if (res.ok) {
              snackbarTranslated(
                t(translationRequests + "CancelReservation.success"),
                "success"
              );
              removeExchangeFromList(event, index);
              return;
            }
            if (resAxios.key !== undefined) {
              snackbarTranslated(
                t(
                  translationRequests +
                    "CancelReservation.Error." +
                    resAxios.key
                ),
                "error"
              );
              return;
            }
            throw new Error();
          })
          .catch((error) => {
            snackbarTranslated(
              t(translationRequests + "CancelReservation.Error.general"),
              "error"
            );
          });
      })
      .catch((error) => {
        snackbarTranslated(
          t(translationRequests + "CancelReservation.Error.general"),
          "error"
        );
      });
  };

  const confirmReceipt = async (event: React.FormEvent) => {
    event.preventDefault();

    const redExchangeId = exchange.id;
    const path = "exchangeState";

    const requestOptions = {
      body: JSON.stringify({
        value: "COMPLETED",
      }),
      headers: {
        "If-Match": exchange.etag,
      },
    };

    await fetchWithAuthorization(
      `${foodExchangeUrl}exchanges/${redExchangeId}/${path}`,
      HTTP_PATCH,
      requestOptions
    ).then((res: Response) => {
      res
        .json()
        .then((resAxios) => {
          if (res.ok) {
            snackbarTranslated(
              t(translationRequests + "ConfirmReceiptProduct.success"),
              "success"
            );
            setIsDialogOpen(true);
            setUpdatedExchange(index, resAxios.exchange);

            return;
          }
          if (resAxios.key !== undefined) {
            snackbarTranslated(
              t(
                translationRequests +
                  "ConfirmReceiptProduct.Error." +
                  resAxios.key
              ),
              "error"
            );
            return;
          }
          throw new Error();
        })
        .catch((error) => {
          snackbarTranslated(
            t(translationRequests + "ConfirmReceiptProduct.Error.general"),
            "error"
          );
        })
        .catch((error) => {
          snackbarTranslated(
            t(translationRequests + "ConfirmReceiptProduct.Error.general"),
            "error"
          );
        });
    });
  };

  return (
    <Card
      sx={{
        margin: 2,
        transform: "scale(1)",
        transition: "transform 0.2s",
        "&:hover": {
          transform: "scale(1.03)",
        },
      }}
      elevation={4}
      key={exchange.id}
    >
      <CardHeader
        action={
          <>
            {allowToCancelReservation() && (
              <IconButton onClick={(e) => cancelReservation(e)}>
                <EventBusyIcon />
              </IconButton>
            )}
          </>
        }
        title={exchange.product.name}
        style={{ color: secondary }}
      ></CardHeader>
      <CardContent>
        <Grid container justifyContent="flex-start">
          <Grid item xs={6}>
            <Typography variant="body1">
              {t(
                translation +
                  "Categories." +
                  exchange.product.categories?.toLowerCase()
              )}
            </Typography>
            <Typography variant="body1">
              {formatDate(exchange.product.startExchangeTime)} {" - "}
              {formatDate(exchange.product.endExchangeTime)}
            </Typography>
            <Typography variant="body1">
              {formatTime(exchange.product.startExchangeTime)} {" - "}
              {formatTime(exchange.product.endExchangeTime)}
            </Typography>
            <Typography variant="body1">
              {t(translation + "ExchangeStates." + exchange?.exchangeState)}
            </Typography>
          </Grid>
          <Grid
            container
            item
            direction="column"
            xs={6}
            justifyContent="flex-end"
            alignItems={"flex-end"}
            spacing={1}
          >
            <Box display="flex" flexDirection="column" width="80%">
              <ConfrimReceiptDeliveryButton
                handleConfirmReceipt={confirmReceipt}
                currentRole={currentRole}
                exchange={exchange}
                index={index}
                t={t}
              />
              <RatingDelivery
                handleSetOpen={handleOpenRatingDeliveryDialog}
                open={isDialogOpen}
                deliveryId={exchange.deliveryId}
                exchange={exchange}
              />
              {allowShowRateButton() && (
                <Button
                  sx={{ marginTop: 1 }}
                  variant="contained"
                  color="primary"
                  onClick={handleOpenRatingDeliveryDialog}
                >
                  {exchange.deliveryId === undefined
                    ? t(translation + "ratingExchange")
                    : t(translation + "ratingDeliveries")}
                </Button>
              )}
              <Button
                sx={{ marginTop: 1 }}
                size="small"
                variant="contained"
                onClick={handleDetailsExchangeDialog}
              >
                {t(translation + "detailsButton")}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
      {isDialogDetailsExchangeOpen && (
        <DetailsCardExchange
          open={isDialogDetailsExchangeOpen}
          exchange={exchange}
          handleSetOpen={handleDetailsExchangeDialog}
          setUpdatedExchange={setUpdatedExchange}
          index={index}
        />
      )}
    </Card>
  );
}
export default ExchangeCard;
