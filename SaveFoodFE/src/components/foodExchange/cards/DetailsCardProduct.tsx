import CancelIcon from "@mui/icons-material/Cancel";
import EditIcon from "@mui/icons-material/Edit";
import { Grid, IconButton, Typography, TypographyVariant } from "@mui/material";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Rating from "@mui/material/Rating";
import { Divider } from "@nextui-org/react";
import Cookies from "js-cookie";
import { useContext, useEffect, useState } from "react";
import Modal from "react-modal";
import mapStyles from "~/styles/foodExchange.module.css";
import { GridTextItem } from "../../../UIcomponents";
import Map from "../../../components/map";
import { foodExchangeDictionary } from "../../../constants/dictionary";
import { HTTP_GET } from "../../../constants/httpMethods";
import {
  CLIENT_ADMIN,
  CLIENT_MODERATOR,
  CLIENT_USER,
} from "../../../constants/roles";
import { foodExchangeUrl } from "../../../constants/url/foodExchange";
import { TOKEN } from "../../../constants/variables";
import {
  DialogActionIsOpen,
  DialogActionOpen,
} from "../../../type/dialogAction";
import {
  DeliveryToUser,
  Exchange,
  Product,
  ProductState,
  ProductStateType,
  ProductionType,
} from "../../../type/mzwz";
import fetchWithAuthorization from "../../../utils/axios/fetchWrapper";
import { formatDate, formatTime } from "../../../utils/date/date";
import LoadingSpinner from "../../../utils/loading_spinner/LoadingSpinner";
import snackbarTranslated from "../../../utils/snackbar/snackbarTranslated";
import { useAppTranslation } from "../../../utils/translation/translationWrapper";
import { UserContext } from "../../context/UserContextProvider";
import { EditModeProduct } from "./EditModeProduct";

interface ProductProps {
  product: Product;
  setUpdatedProduct: {
    (index: number, changedProduct: Product): void;
  };
  index: number;
}

type ProductPropsWithDialog = ProductProps &
  DialogActionOpen &
  DialogActionIsOpen;

export function DetailsCardProduct({
  product,
  open,
  handleSetOpen,
  setUpdatedProduct,
  index,
}: ProductPropsWithDialog) {
  const handleClose = () => {
    handleSetOpen(false);
  };
  const t = useAppTranslation(foodExchangeDictionary);
  const [exchange, setExchange] = useState<Exchange>();
  const [deliveryToUser, setDeliveryToUser] = useState<DeliveryToUser>();
  const [editMode, setEditMode] = useState(false);
  const translation = "Tabs.ProductCard.DetailsCardProduct.";
  const translationProductCard = "Tabs.ProductCard.";
  const translationRequests = "Tabs.ProductCard.DetailsCardProduct.Requests.";
  const [loading, setLoading] = useState(false);
  const token = Cookies.get(TOKEN);
  const { currentRole, usernameAccount } = useContext(UserContext);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const visibleButton = [
    ProductState.VISIBLE,
    ProductState.HIDDEN,
  ] as ProductStateType[];
  const allowsEditProductRoles = [CLIENT_ADMIN, CLIENT_MODERATOR, CLIENT_USER];
  const showEditButton = function () {
    if (!allowsEditProductRoles.includes(currentRole)) {
      return false;
    }

    if (
      currentRole === CLIENT_USER &&
      product.accountUserName !== usernameAccount
    ) {
      return false;
    }

    return true;
  };
  useEffect(() => {
    fetchProduct();
    product.exchangeId !== null && token && handleFetchExchange();
    setLoading(false);
  }, [product.id]);

  const handleFetchExchange = async () => {
    const queryParams = new URLSearchParams();
    const redExchangeId = product.exchangeId;
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
              resAxios.exchange.deliveryToUser !== null &&
                handleFetchDeliveryToUser(resAxios.exchange.deliveryToUser.id);
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
    setLoading(false);
  };

  const handleFetchDeliveryToUser = async (redDeliveryToUserId: string) => {
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

  const fetchProduct = async () => {
    setLoading(true);

    const redProductId = product.id;

    await fetchWithAuthorization(
      `${foodExchangeUrl}product/${redProductId}`,
      HTTP_GET
    )
      .then((res: Response) => {
        res
          .json()
          .then((resAxios) => {
            if (res.ok) {
              setUpdatedProduct(index, resAxios.product);
              return;
            }
            if (resAxios.key !== undefined) {
              snackbarTranslated(
                t(translationRequests + "FetchProduct.Error." + resAxios.key),
                "error"
              );
              return;
            }
            throw new Error();
          })
          .catch((error) => {
            snackbarTranslated(
              t(translationRequests + "FetchProduct.Error.general"),
              "error"
            );
          });
      })
      .catch((error) => {
        snackbarTranslated(
          t(translationRequests + "FetchProduct.Error.general"),
          "error"
        );
      });
  };
  return (
    <Dialog open={open} onClose={handleClose} fullWidth={true} maxWidth={"md"}>
      <LoadingSpinner open={loading} />
      {!editMode && !loading && (
        <>
          <DialogTitle>
            <Grid container>
              <GridTextItem
                gridProps={{ xs: 10 }}
                text={product.name}
                typographyProps={{ variant: "h3" }}
              />
              <Grid container item xs={2} justifyContent="flex-end">
                {showEditButton() && (
                  <IconButton>
                    <EditIcon
                      fontSize="large"
                      onClick={(e) => setEditMode(true)}
                    />
                  </IconButton>
                )}
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
                text={formatDate(product.startExchangeTime)}
              />
              <GridTextItem
                header={t(translation + "receiptDateTo") + ": "}
                text={formatDate(product.endExchangeTime)}
              />
              <GridTextItem
                header={t(translation + "receiptHourFrom") + ": "}
                text={formatTime(product.startExchangeTime)}
              />
              <GridTextItem
                header={t(translation + "receiptHourTo") + ": "}
                text={formatTime(product.endExchangeTime)}
              />
              <GridTextItem
                header={t(translation + "expirationDate") + ": "}
                text={product.expirationDate}
              />

              {token && (
                <GridTextItem
                  header={t(translation + "adress") + ": "}
                  text={
                    product.mapAddress.street +
                    " " +
                    product.mapAddress.streetNumber +
                    ", " +
                    product.mapAddress.postalCode +
                    " " +
                    product.mapAddress.city
                  }
                />
              )}

              <Grid container item xs={12}>
                <Grid item xs={6}>
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

                  <GridTextItem
                    header={
                      t(
                        translationProductCard + "ProductionType.productionType"
                      ) + ": "
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
                  {product.homemade && (
                    <GridTextItem
                      header={t(translation + "productionDate") + ": "}
                      text={formatDate(product.productionDate)}
                    />
                  )}
                </Grid>

                <Grid item xs={6} marginBottom={1} marginTop={1}>
                  <div
                    onClick={() => setModalIsOpen(true)}
                    className={mapStyles["map-container"]}
                  >
                    {product && (
                      <Map
                        products={[product]}
                        specificLatitude={product.mapAddress.latitude}
                        specificLongitude={product.mapAddress.longitude}
                        addressIconUrl="/icons/diet.png"
                        mapLabel={t("grade")}
                      />
                    )}
                  </div>
                </Grid>
                <Modal
                  isOpen={modalIsOpen}
                  onRequestClose={() => setModalIsOpen(false)}
                  className={mapStyles["modal-content"]}
                  overlayClassName={mapStyles["modal-overlay"]}
                  shouldCloseOnOverlayClick={true}
                >
                  {product && (
                    <Map
                      products={[product]}
                      specificLatitude={product.mapAddress.latitude}
                      specificLongitude={product.mapAddress.longitude}
                      addressIconUrl="/icons/diet.png"
                      mapLabel={t("grade")}
                    />
                  )}
                </Modal>
              </Grid>

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
      {showEditButton() && editMode && (
        <EditModeProduct
          product={product}
          setUpdatedProduct={setUpdatedProduct}
          index={index}
          setEditMode={setEditMode}
        />
      )}
    </Dialog>
  );
}

export default DetailsCardProduct;
