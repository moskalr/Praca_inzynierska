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
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { secondary } from "../../../constants/colors";
import { HTTP_PATCH } from "../../../constants/httpMethods";
import { foodExchangeUrl } from "../../../constants/url/foodExchange";
import { DeliveryToUser, ExchangeState } from "../../../type/mzwz";
import fetchWithAuthorization from "../../../utils/axios/fetchWrapper";
import { formatDateToDisplay } from "../../../utils/date/date";
import { snackbarTranslated } from "../../../utils/snackbar/snackbarTranslated";
import DetailsCardDeliveryToUser from "../cards/DetailsCardDeliveryToUser";

interface DeliveryToUserProps {
  deliveryToUser: DeliveryToUser;
  index: number;
  removeDeliveryFromList: (e: React.FormEvent, index: number) => void;
}

function OwnDeliveryToUserCard({
  deliveryToUser,
  index,
  removeDeliveryFromList,
}: DeliveryToUserProps) {
  const [isDialogDetailsDeliveryOpen, setIsDialogDetailsDetailsDeliveryOpen] =
    useState(false);
  const [hydrated, setHydrated] = useState(false);
  const { t } = useTranslation("foodExchange");
  const translation = "Tabs.AllDeliveries.DeliveryCard.";
  const handleDetailsDeliveryDialog = () => {
    setIsDialogDetailsDetailsDeliveryOpen((prev) => !prev);
  };
  const allowCancelDeliveryReservation = () => {
    if (
      deliveryToUser.exchange.exchangeState ===
        ExchangeState.WAITING_FOR_RECEIPT_PRODUCT ||
      deliveryToUser.exchange.exchangeState ===
        ExchangeState.WAITING_FOR_RESERVED_DELIVERY
    ) {
      return true;
    }
  };
  useEffect(() => {
    setHydrated(true);
  }, []);

  if (!hydrated) {
    return null;
  }
  const setUpdatedDelivery = (
    index: number,
    deliveryToUser: DeliveryToUser
  ) => {
    return;
  };
  const cancelReservation = async (event: React.FormEvent) => {
    event.preventDefault();

    const redDeliveryToUserId = deliveryToUser.id;
    const path = "/deliveryState";

    const requestOptions = {
      body: JSON.stringify({
        value: "WAITING_FOR_VOLUNTEER",
      }),
      headers: {
        "If-Match": deliveryToUser.etag,
      },
    };

    const response = await fetchWithAuthorization(
      `${foodExchangeUrl}deliveryToUser/${redDeliveryToUserId}/${path}`,
      HTTP_PATCH,
      requestOptions
    )
      .then((res: Response) => {
        res
          .json()
          .then((resAxios) => {
            if (res.ok) {
              snackbarTranslated(t("Product.Hide.success"), "success");
              removeDeliveryFromList(event, index);
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
      key={deliveryToUser.id}
    >
      <CardHeader
        action={
          <>
            {allowCancelDeliveryReservation() && (
              <IconButton>
                <EventBusyIcon onClick={cancelReservation} />
              </IconButton>
            )}
          </>
        }
        title={deliveryToUser.exchange.product.name}
        style={{ color: secondary }}
      ></CardHeader>
      <CardContent>
        <Grid container justifyContent="flex-start">
          <Grid item xs={6}>
            <Typography variant="body1">
              {t(
                translation +
                  "Categories." +
                  deliveryToUser.exchange.product.categories?.toLowerCase()
              )}
            </Typography>
            <Typography variant="body1">
              {formatDateToDisplay(
                deliveryToUser.exchange.product.startExchangeTime
              )}
              {" - "}
              {formatDateToDisplay(
                deliveryToUser.exchange.product.endExchangeTime
              )}
            </Typography>

            <Typography variant="body1">
              {t(
                translation + "DeliveryStates." + deliveryToUser.deliveryState
              )}
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
              <Button
                size="small"
                variant="contained"
                onClick={handleDetailsDeliveryDialog}
              >
                {t(translation + "detailsButton")}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
      {isDialogDetailsDeliveryOpen && (
        <DetailsCardDeliveryToUser
          open={isDialogDetailsDeliveryOpen}
          deliveryToUser={deliveryToUser}
          handleSetOpen={handleDetailsDeliveryDialog}
          setUpdatedDelivery={setUpdatedDelivery}
          index={index}
        />
      )}
    </Card>
  );
}
export default OwnDeliveryToUserCard;
