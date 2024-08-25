import CancelIcon from "@mui/icons-material/Cancel";
import EditIcon from "@mui/icons-material/Edit";
import {
  Divider,
  IconButton,
  Rating,
  Typography,
  TypographyVariant,
} from "@mui/material";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Grid from "@mui/material/Grid";
import { useEffect, useState } from "react";
import { GridTextItem } from "../../../UIcomponents";
import { foodExchangeDictionary } from "../../../constants/dictionary";
import { HTTP_GET } from "../../../constants/httpMethods";
import { foodExchangeUrl } from "../../../constants/url/foodExchange";
import {
  DialogActionIsOpen,
  DialogActionOpen,
} from "../../../type/dialogAction";
import {
  DeliveryToUser,
  Exchange,
  Product,
  ProductionType,
} from "../../../type/mzwz";
import fetchWithAuthorization from "../../../utils/axios/fetchWrapper";
import { formatDateToDisplay } from "../../../utils/date/date";
import snackbarTranslated from "../../../utils/snackbar/snackbarTranslated";
import { useAppTranslation } from "../../../utils/translation/translationWrapper";

interface DeliveryToUserProps {
  deliveryToUser: DeliveryToUser;
  setUpdatedDelivery: {
    (index: number, changedDelivery: DeliveryToUser): void;
  };
  index: number;
}

type DeliveryPropsWithDialog = DeliveryToUserProps &
  DialogActionOpen &
  DialogActionIsOpen;

function DetailsCardDeliveryToUser({
  deliveryToUser,
  open,
  handleSetOpen,
  setUpdatedDelivery,
  index,
}: DeliveryPropsWithDialog) {
  useEffect(() => {
    (deliveryToUser.exchange.id !== null ||
      deliveryToUser.exchange.id !== undefined) &&
      handleFetchExchange();
  }, [deliveryToUser.id]);
  const handleClose = () => {
    handleSetOpen(false);
  };
  const [product, setProduct] = useState<Product>(
    deliveryToUser.exchange.product
  );
  const [loading, setLoading] = useState(true);
  const [exchange, setExchange] = useState<Exchange>();
  const t = useAppTranslation(foodExchangeDictionary);
  const translation = "Tabs.AllDeliveries.DeliveryCard.DetailsCardProduct.";
  const translationProductCard = "Tabs.AllDeliveries.DeliveryCard.";
  const [editMode, setEditMode] = useState(false);

  const handleFetchExchange = async () => {
    setLoading(true);

    const queryParams = new URLSearchParams();
    const redExchangeId = deliveryToUser.exchange.id;
    await fetchWithAuthorization(
      `${foodExchangeUrl}exchanges/${redExchangeId}`,
      HTTP_GET
    )
      .then((res) => {
        res
          .json()
          .then((resAxios) => {
            if (res.ok) {
              setExchange(resAxios.exchange);
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
                text={deliveryToUser.exchange.product.name}
                typographyProps={{ variant: "h3" }}
              />
              <Grid container item xs={6} justifyContent="flex-end">
                <IconButton>
                  <EditIcon
                    fontSize="large"
                    onClick={(e) => setEditMode(true)}
                  />
                </IconButton>
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
            <GridTextItem
              text={t(translation + "productDetails")}
              gridProps={{ xs: 12 }}
              typographyProps={{ variant: "h4" }}
            />
            <Grid container>
              <GridTextItem
                text={product.description}
                header={t(translation + "describe") + ": "}
              />
              <GridTextItem
                header={t(translation + "category") + ": "}
                text={t(
                  translationProductCard +
                    "Categories." +
                    product.categories?.toLowerCase()
                )}
              />
              <GridTextItem
                header={t(translation + "foodDonor") + ": "}
                text={product.accountUserName}
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
                  value={product.accountAvgRating}
                  readOnly
                />
              </Grid>

              <GridTextItem
                header={t(translation + "receiptDateFrom") + ": "}
                text={formatDateToDisplay(product.startExchangeTime)}
              />
              <GridTextItem
                header={t(translation + "receiptDateTo") + ": "}
                text={formatDateToDisplay(product.endExchangeTime)}
              />
              <GridTextItem
                header={t(translation + "expirationDate") + ": "}
                text={product.expirationDate}
              />
              {product.homemade && (
                <GridTextItem
                  header={t(translation + "productionDate") + ": "}
                  text={product.productionDate}
                />
              )}
              <GridTextItem
                header={
                  t(translationProductCard + "ProductionType.productionType") +
                  ": "
                }
                text={
                  product.homemade
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
                    product.productState
                )}
              />

              {exchange && !deliveryToUser && (
                <>
                  <Grid item xs={12}>
                    <Divider />
                  </Grid>
                  <GridTextItem
                    text={t(translation + "exchangeDetails")}
                    gridProps={{ xs: 12, sx: { marginTop: 2 } }}
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
                      value={product.accountAvgRating}
                      readOnly
                    />
                  </Grid>
                  <GridTextItem
                    header={
                      t(
                        translationProductCard + "ExchangeStates.exchangeState"
                      ) + ": "
                    }
                    text={t(translationProductCard + exchange?.exchangeState)}
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
                      value={product.accountAvgRating}
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
                </>
              )}
            </Grid>
          </DialogContent>
        </>
      )}
    </Dialog>
  );
}

export default DetailsCardDeliveryToUser;
