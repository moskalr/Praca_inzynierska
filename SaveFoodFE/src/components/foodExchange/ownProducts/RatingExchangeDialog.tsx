import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Rating from "@mui/material/Rating";

import { useState } from "react";
import { foodExchangeDictionary } from "../../../constants/dictionary";
import { HTTP_GET, HTTP_POST } from "../../../constants/httpMethods";
import { foodExchangeUrl } from "../../../constants/url/foodExchange";
import {
  DialogActionIsOpen,
  DialogActionOpen,
} from "../../../type/dialogAction";
import { Exchange } from "../../../type/mzwz";
import fetchWithAuthorization from "../../../utils/axios/fetchWrapper";
import snackbarTranslated from "../../../utils/snackbar/snackbarTranslated";
import { useAppTranslation } from "../../../utils/translation/translationWrapper";

const translation = "Tabs.OwnProducts.OwnProductCard.RatingExchangeDialog.";

interface RatingExchangeProps {
  exchangeId: string;
}

type RatingExchangePropsWithDialog = RatingExchangeProps &
  DialogActionOpen &
  DialogActionIsOpen;

function RatingExchange({
  exchangeId,
  open,
  handleSetOpen,
}: RatingExchangePropsWithDialog) {
  const t = useAppTranslation(foodExchangeDictionary);

  const handleRate = async (exchange: Exchange) => {
    const requestOptions = {
      body: JSON.stringify({
        eventId: exchangeId,
        starNumber: starValue,
        ratedAccountId: exchange.accountId,
      }),
    };

    await fetchWithAuthorization(
      "api/foodExchange/rating-exchange",
      HTTP_POST,
      requestOptions
    )
      .then((res: Response) => {
        res
          .json()
          .then((resAxios) => {
            if (res.ok) {
              snackbarTranslated(
                t(translation + "ReservationSnackbar.success"),
                "success"
              );
              handleSetOpen(false);
              return;
            }
            if (resAxios.key !== undefined) {
              snackbarTranslated(resAxios.key, "error");
            } else {
              throw new Error();
            }
          })
          .catch((error) => {
            snackbarTranslated(
              t(translation + "ReservationSnackbar.success"),
              "error"
            );
          });
      })
      .catch((error) => {
        snackbarTranslated(t("noItemsSec.end"), "error");
      });
  };

  const getAccountToRate = async () => {
    const redExchandeId = exchangeId;

    await fetchWithAuthorization(
      `${foodExchangeUrl}exchanges/${redExchandeId}`,
      HTTP_GET
    )
      .then((res: Response) => {
        res
          .json()
          .then((resAxios) => {
            handleRate(resAxios.exchange);
          })
          .catch((error) => {
            snackbarTranslated(t("Product.Hide.error"), "error");
          });
      })
      .catch((error) => {
        snackbarTranslated(t("noItemsSec.end"), "error");
      });
  };

  const [starValue, setStarValue] = useState<number | null>(0);

  return (
    <Dialog open={open}>
      <DialogTitle>
        {exchangeId} {translation + "title"}
      </DialogTitle>
      <DialogContent>
        <Rating
          value={starValue}
          onChange={(event, newValue) => {
            setStarValue(newValue);
          }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={getAccountToRate}>{translation + "rateButton"}</Button>
      </DialogActions>
    </Dialog>
  );
}

export default RatingExchange;
