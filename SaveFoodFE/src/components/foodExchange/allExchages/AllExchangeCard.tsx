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
import { HTTP_PATCH } from "../../../constants/httpMethods";
import { CLIENT_ADMIN, CLIENT_USER } from "../../../constants/roles";
import { foodExchangeUrl } from "../../../constants/url/foodExchange";
import { Exchange } from "../../../type/mzwz";
import fetchWithAuthorization from "../../../utils/axios/fetchWrapper";
import { formatDate, formatTime } from "../../../utils/date/date";
import snackbarTranslated from "../../../utils/snackbar/snackbarTranslated";
import { UserContext } from "../../context/UserContextProvider";
import DetailsCardExchange from "../cards/DetailsCardExchange";
import RatingDelivery from "../exchanges/RatingDeliveryDialog";

const translation = "Tabs.AllExchanges.ExchangeCard.";

interface ConfrimReceiptDeliveryProps {
  handleConfirmReceipt: (e: React.FormEvent) => void;
  currentRole: string;
  exchange: Exchange;
  t: any;
  index: number;
}
const allowedRoles = [CLIENT_ADMIN, CLIENT_USER];

const ConfrimReceiptDeliveryButton = ({
  handleConfirmReceipt,
  currentRole,
  exchange,
  index,
  t,
}: ConfrimReceiptDeliveryProps) => {
  return (
    <>
      {allowedRoles.includes(currentRole) &&
        exchange.exchangeState === "WAITING_FOR_PENDING_DELIVERIES" && (
          <Button
            onClick={handleConfirmReceipt}
            variant="contained"
            disabled={
              exchange.exchangeState !== "WAITING_FOR_PENDING_DELIVERIES"
            }
          >
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
}

export function AllExchangeCard({
  exchange,
  index,
  removeExchangeFromList,
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
  const setUpdatedProduct = (index: number, product: Exchange) => {
    return;
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
              snackbarTranslated(t("Product.Hide.success"), "success");
              return;
            }
            if (resAxios.key !== undefined) {
              snackbarTranslated(resAxios.key, "error");
              return;
            }
            throw new Error();
          })
          .catch((error) => {
            snackbarTranslated(t("Product.Hide.error"), "error");
          });
      })
      .catch((error) => {
        snackbarTranslated(t("Product.Hide.error"), "error");
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
            snackbarTranslated(t("Product.Hide.success"), "success");
            setIsDialogOpen(true);
            return;
          }
          if (resAxios.key !== undefined) {
            snackbarTranslated(resAxios.key, "error");
            return;
          }
          throw new Error();
        })
        .catch((error) => {
          snackbarTranslated(t("Product.Hide.error"), "error");
        })
        .catch((error) => {
          snackbarTranslated(t("Product.Hide.error"), "error");
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
            <IconButton onClick={(e) => cancelReservation(e)}>
              <EventBusyIcon />
            </IconButton>
          </>
        }
        title={exchange.product.name + "  " + exchange.product.id + exchange.id}
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
              <Button
                sx={{ marginTop: 1 }}
                variant="contained"
                color="primary"
                onClick={handleOpenRatingDeliveryDialog}
              >
                {exchange.deliveryId === null
                  ? t(translation + "ratingExchange")
                  : t(translation + "ratingDeliveries")}
              </Button>
              <Button
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
          setUpdatedExchange={setUpdatedProduct}
          index={index}
        />
      )}
    </Card>
  );
}
export default AllExchangeCard;
