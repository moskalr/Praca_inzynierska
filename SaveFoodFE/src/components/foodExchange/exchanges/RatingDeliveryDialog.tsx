import CancelIcon from "@mui/icons-material/Cancel";
import {
  Box,
  Grid,
  IconButton,
  Typography,
  TypographyVariant,
} from "@mui/material";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Rating from "@mui/material/Rating";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { GridTextItem } from "../../../UIcomponents";
import { HTTP_GET, HTTP_POST } from "../../../constants/httpMethods";
import { foodExchangeUrl } from "../../../constants/url/foodExchange";
import { DeliveryToUser, Exchange } from "../../../type/mzwz";
import fetchWithAuthorization from "../../../utils/axios/fetchWrapper";
import snackbarTranslated from "../../../utils/snackbar/snackbarTranslated";

const dictionary = "foodExchange";
const translation = "Tabs.AllExchanges.ExchangeCard.Rating.";
const translationRequests = "Tabs.AllExchanges.ExchangeCard.Rating.Requests.";
interface RatingDeliveryProps {
  deliveryId?: number;
  open: boolean;
  handleSetOpen: (open: boolean) => void;
  exchange: Exchange;
}

function RatingDelivery({
  deliveryId,
  open,
  handleSetOpen,
  exchange,
}: RatingDeliveryProps) {
  const { t } = useTranslation(dictionary);
  const [deliveryToUser, setDeliveryToUser] = useState<DeliveryToUser>();

  const handleRateDelivery = async (deliveryToUser: DeliveryToUser) => {
    const requestOptions = {
      body: JSON.stringify({
        eventId: deliveryId,
        starNumber: starValue,
        ratedAccountId: deliveryToUser.accountId,
      }),
    };

    await fetchWithAuthorization(
      `${foodExchangeUrl}rating-delivery`,
      HTTP_POST,
      requestOptions
    )
      .then((res: Response) => {
        res
          .json()
          .then((resAxios) => {
            if (res.ok) {
              snackbarTranslated(
                t(translationRequests + "RateDelivery.success"),
                "success"
              );
              handleSetOpen(false);
              return;
            }
            if (resAxios.key !== undefined) {
              snackbarTranslated(
                t(translationRequests + "RateDelivery.Error." + resAxios.key),
                "error"
              );
              return;
            }
            throw new Error();
          })
          .catch((error) => {
            snackbarTranslated(
              t(translationRequests + "RateDelivery.Error.general"),
              "error"
            );
          });
      })
      .catch((error) => {
        snackbarTranslated(
          t(translationRequests + "RateDelivery.Error.general"),
          "error"
        );
      });
  };

  const handleRateExchange = async () => {
    const requestOptions = {
      body: JSON.stringify({
        eventId: exchange.id,
        starNumber: starValue,
        ratedAccountId: exchange.product.accountId,
      }),
    };
    await fetchWithAuthorization(
      `${foodExchangeUrl}rating-exchange`,
      HTTP_POST,
      requestOptions
    )
      .then((res: Response) => {
        res
          .json()
          .then((resAxios) => {
            if (res.ok) {
              snackbarTranslated(
                t(translationRequests + "RateExchange.success"),
                "success"
              );
              handleSetOpen(false);
              return;
            }
            if (resAxios.key !== undefined) {
              snackbarTranslated(
                t(translationRequests + "RateExchange.Error." + resAxios.key),
                "error"
              );
              return;
            }
            throw new Error();
          })
          .catch((error) => {
            snackbarTranslated(
              t(translationRequests + "RateExchange.Error.general"),
              "error"
            );
          });
      })
      .catch((error) => {
        snackbarTranslated(
          t(translationRequests + "RateExchange.Error.general"),
          "error"
        );
      });
  };

  const getAccountToRate = async () => {
    const redDeliveryId = deliveryId;
    await fetchWithAuthorization(
      `${foodExchangeUrl}deliveryToUser/${redDeliveryId}`,
      HTTP_GET
    ).then((res: Response) => {
      res
        .json()
        .then((resAxios) => {
          if (res.ok) {
            handleRateDelivery(resAxios.deliveryToUser);
            setDeliveryToUser(resAxios.deliveryToUser);

            return;
          }
          if (resAxios.key !== undefined) {
            snackbarTranslated(
              t(translationRequests + "GetAccount.Error." + resAxios.key),
              "error"
            );
            return;
          }
          throw new Error();
        })
        .catch((error) => {
          snackbarTranslated(
            t(translationRequests + "GetAccount.Error.general"),
            "error"
          );
        })
        .catch((error) => {
          snackbarTranslated(
            t(translationRequests + "GetAccount.Error.general"),
            "error"
          );
        });
    });
  };

  const [starValue, setStarValue] = useState<number | null>(0);

  return (
    <Dialog open={open}>
      <DialogTitle>
        <Grid container>
          <GridTextItem
            text={
              deliveryId === undefined
                ? t(translation + "ratingExchange")
                : t(translation + "ratingDelivery")
            }
            typographyProps={{ variant: "h5" }}
            gridProps={{ xs: 11 }}
          />
          <Grid container item xs={1} justifyContent="flex-end">
            <IconButton>
              <CancelIcon
                fontSize="large"
                onClick={(e) => handleSetOpen(false)}
              />
            </IconButton>
          </Grid>
        </Grid>
      </DialogTitle>
      <DialogContent>
        <Grid container>
          <GridTextItem
            header={t(translation + "rateUser") + ": "}
            text={
              deliveryId === undefined
                ? exchange.product.accountUserName
                : deliveryToUser?.accountUsername
            }
          />

          <Grid container direction="column" item xs={6} sx={{ marginTop: 1 }}>
            <Typography variant={"buttom" as TypographyVariant}>
              {t(translation + "rate") + ": "}
            </Typography>
            <Rating
              size="large"
              value={starValue}
              onChange={(event, newValue) => {
                setStarValue(newValue);
              }}
            />
          </Grid>
        </Grid>
        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
          <Button
            onClick={(e) =>
              deliveryId === undefined
                ? handleRateExchange()
                : getAccountToRate()
            }
            sx={{ margin: 1 }}
            variant="contained"
          >
            {t(translation + "rateButton")}
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
}

export default RatingDelivery;
