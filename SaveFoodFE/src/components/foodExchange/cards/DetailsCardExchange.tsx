import CancelIcon from "@mui/icons-material/Cancel";
import {
  Divider,
  Grid,
  IconButton,
  Rating,
  Typography,
  TypographyVariant,
} from "@mui/material";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { useEffect, useState } from "react";
import { GridTextItem } from "../../../UIcomponents";
import { foodExchangeDictionary } from "../../../constants/dictionary";
import { HTTP_GET } from "../../../constants/httpMethods";
import { foodExchangeUrl } from "../../../constants/url/foodExchange";
import {
  DialogActionIsOpen,
  DialogActionOpen,
} from "../../../type/dialogAction";
import { DeliveryToUser, Exchange, ProductionType } from "../../../type/mzwz";
import fetchWithAuthorization from "../../../utils/axios/fetchWrapper";
import { formatDateToDisplay } from "../../../utils/date/date";
import snackbarTranslated from "../../../utils/snackbar/snackbarTranslated";
import { useAppTranslation } from "../../../utils/translation/translationWrapper";

interface ExchangeProps {
  exchange: Exchange;
  setUpdatedExchange: {
    (index: number, changedExchange: Exchange): void;
  };
  index: number;
}

type ProductPropsWithDialog = ExchangeProps &
  DialogActionOpen &
  DialogActionIsOpen;

function DetailsCardExchange({
  exchange,
  open,
  handleSetOpen,
  setUpdatedExchange,
  index,
}: ProductPropsWithDialog) {
  useEffect(() => {
    exchange.deliveryToUser !== null && handleFetchDeliveryToUser();
  }, [exchange]);
  const handleClose = () => {
    handleSetOpen(false);
  };
  const translationProductCard = "Tabs.AllExchanges.ExchangeCard.";
  const translation = "Tabs.AllExchanges.ExchangeCard.DetailsCardProduct.";

  const [deliveryToUser, setDeliveryToUser] = useState<DeliveryToUser>();
  const t = useAppTranslation(foodExchangeDictionary);
  const [editMode, setEditMode] = useState(false);

  const handleFetchDeliveryToUser = async () => {
    const redDeliveryToUserId = exchange.deliveryToUser?.id;
    await fetchWithAuthorization(
      `${foodExchangeUrl}deliveryToUser/${redDeliveryToUserId}`,
      HTTP_GET
    )
      .then((res) => {
        res
          .json()
          .then((resAxios) => {
            if (res.ok) {
              setDeliveryToUser(resAxios.deliveryToUser);
              return;
            }
            throw new Error();
          })
          .catch((error) => {
            snackbarTranslated(t("somethingWentWrong"), "error");
          });
      })
      .catch((error) => {
        snackbarTranslated(t("somethingWentWrong"), "error");
      });
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth={true} maxWidth={"md"}>
      {!editMode && (
        <>
          <DialogTitle>
            <Grid container>
              <GridTextItem
                text={
                  t(translation + "reservationTitle") + exchange.product.name
                }
                typographyProps={{ variant: "h3" }}
                gridProps={{ xs: 10 }}
              />
              <Grid container item xs={2} justifyContent="flex-end">
                {/* <IconButton>
                  <EditIcon
                    fontSize="large"
                    onClick={(e) => setEditMode(true)}
                  />
                </IconButton> */}
                <IconButton>
                  <CancelIcon
                    fontSize="large"
                    onClick={(e) => handleSetOpen(false)}
                  />
                </IconButton>
              </Grid>
            </Grid>
          </DialogTitle>
          <Grid item xs={12}>
            <Divider />
          </Grid>
          <DialogContent>
            <Grid container>
              {!deliveryToUser && (
                <>
                  <GridTextItem
                    text={t(translation + "exchangeDetails")}
                    gridProps={{ xs: 12 }}
                    typographyProps={{ variant: "h4" }}
                  />
                  <GridTextItem
                    header={t(translation + "foodRecipient") + ": "}
                    text={exchange?.accountUsername}
                  />
                  <Grid
                    container
                    direction="column"
                    item
                    xs={6}
                    sx={{ marginTop: 1 }}
                  >
                    <Typography variant={"buttom" as TypographyVariant}>
                      {t(translation + "foodRecipientRating") + ": "}
                    </Typography>
                    <Rating
                      name="read-only"
                      size="large"
                      value={exchange.product.accountAvgRating}
                      readOnly
                    />
                  </Grid>
                  <GridTextItem
                    header={
                      t(
                        translationProductCard + "ExchangeStates.exchangeState"
                      ) + ": "
                    }
                    text={t(
                      translationProductCard +
                        "ExchangeStates." +
                        exchange?.exchangeState
                    )}
                  />
                  <GridTextItem
                    header={t(translation + "TypeReservation.title") + ": "}
                    text={t(translation + "TypeReservation.typeOfReceipt")}
                  />
                </>
              )}
              {deliveryToUser && (
                <>
                  <Grid item xs={12}>
                    <Divider />
                  </Grid>
                  <GridTextItem
                    text={t(translation + "delvieryDetails")}
                    gridProps={{ xs: 12, sx: { marginTop: 2 } }}
                    typographyProps={{ variant: "h4" }}
                  />
                  <GridTextItem
                    header={t(translation + "foodDelivery") + ": "}
                    text={deliveryToUser?.accountUsername}
                  />
                  <Grid
                    container
                    direction="column"
                    item
                    xs={6}
                    sx={{ marginTop: 1 }}
                  >
                    <Typography variant={"buttom" as TypographyVariant}>
                      {t(translation + "foodDeliveryRating") + ": "}
                    </Typography>
                    <Rating
                      name="read-only"
                      size="large"
                      value={deliveryToUser.accountAvgRating}
                      readOnly
                    />
                  </Grid>
                  <GridTextItem
                    header={
                      t(
                        translationProductCard + "DeliveryStates.deliveryState"
                      ) + ": "
                    }
                    text={t(
                      translationProductCard +
                        "DeliveryStates." +
                        deliveryToUser?.deliveryState
                    )}
                  />
                  <GridTextItem
                    header={t(translation + "TypeReservation.title") + ": "}
                    text={t(translation + "TypeReservation.delivery")}
                  />
                </>
              )}
              <Grid item xs={12}>
                <Divider />
              </Grid>
              <GridTextItem
                text={t(translation + "productDetails")}
                gridProps={{ xs: 12, sx: { marginTop: 2 } }}
                typographyProps={{ variant: "h4" }}
              />
              <GridTextItem
                text={exchange.product.description}
                header={t(translation + "describe") + ": "}
              />
              <GridTextItem
                header={t(translation + "category") + ": "}
                text={t(
                  translationProductCard +
                    "Categories." +
                    exchange.product.categories?.toLowerCase()
                )}
              />
              <GridTextItem
                header={t(translation + "foodDonor") + ": "}
                text={exchange.product.accountUserName}
              />
              <Grid
                container
                direction="column"
                item
                xs={6}
                sx={{ marginTop: 1 }}
              >
                <Typography variant={"buttom" as TypographyVariant}>
                  {t(translation + "foodDonorRating") + ": "}
                </Typography>
                <Rating
                  name="read-only"
                  size="large"
                  value={exchange.product.accountAvgRating}
                  readOnly
                />
              </Grid>

              <GridTextItem
                header={t(translation + "receiptDateFrom") + ": "}
                text={formatDateToDisplay(exchange.product.startExchangeTime)}
              />
              <GridTextItem
                header={t(translation + "receiptDateTo") + ": "}
                text={formatDateToDisplay(exchange.product.endExchangeTime)}
              />
              <GridTextItem
                header={t(translation + "expirationDate") + ": "}
                text={exchange.product.expirationDate}
              />
              {exchange.product.homemade && (
                <GridTextItem
                  header={t(translation + "productionDate") + ": "}
                  text={exchange.product.productionDate}
                />
              )}
              <GridTextItem
                header={
                  t(translationProductCard + "ProductionType.productionType") +
                  ": "
                }
                text={
                  exchange.product.homemade
                    ? t(
                        translationProductCard +
                          "ProductionType." +
                          ProductionType.HOMEMADE
                      )
                    : t(
                        translationProductCard +
                          "ProductionType." +
                          ProductionType.PURCHASED
                      )
                }
              />
              <GridTextItem
                header={
                  t(translationProductCard + "ProductStates.productState") +
                  ": "
                }
                text={t(
                  translationProductCard +
                    "ProductStates." +
                    exchange.product.productState
                )}
              />
              <GridTextItem text="" />
              <GridTextItem
                header={t(translation + "adress") + ": "}
                text={
                  exchange.product.mapAddress.street +
                  " " +
                  exchange.product.mapAddress.streetNumber +
                  ", " +
                  exchange.product.mapAddress.postalCode +
                  " " +
                  exchange.product.mapAddress.city
                }
              />
            </Grid>
          </DialogContent>
        </>
      )}
      {/* {editMode && (
        <EditModeProduct
          product={product}
          setUpdatedProduct={setUpdatedProduct}
          index={index}
          setEditMode={setEditMode}
        />
      )} */}
    </Dialog>
  );
}

export default DetailsCardExchange;
