import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
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
import { useContext, useEffect, useState } from "react";
import styles from "~/styles/foodExchange.module.css";
import { secondary } from "../../../constants/colors";
import { foodExchangeDictionary } from "../../../constants/dictionary";
import { HTTP_GET, HTTP_PATCH } from "../../../constants/httpMethods";
import { CLIENT_ADMIN, CLIENT_USER } from "../../../constants/roles";
import { foodExchangeUrl } from "../../../constants/url/foodExchange";
import { Product, ProductState, ProductStateType } from "../../../type/mzwz";
import fetchWithAuthorization from "../../../utils/axios/fetchWrapper";
import { snackbarTranslated } from "../../../utils/snackbar/snackbarTranslated";
import { useAppTranslation } from "../../../utils/translation/translationWrapper";
import { UserContext } from "../../context/UserContextProvider";
import DetailsCardProduct from "../cards/DetailsCardProduct";

const translationProductCard = "Tabs.ProductCard.";
const tranlationProductCardRequests = "Tabs.ProductCard.Requests.";
interface ProductProps {
  product: Product;
  index: number;
  changeVisibilityProduct: {
    (e: React.FormEvent, index: number, value: ProductStateType): void;
  };
  removeProductFromList: {
    (e: React.FormEvent, index: number): void;
  };
  setUpdatedProduct: {
    (index: number, changedProduct: Product): void;
  };
}

const allowedRoles = [CLIENT_ADMIN, CLIENT_USER];
const visibleButton = [
  ProductState.VISIBLE,
  ProductState.HIDDEN,
] as ProductStateType[];
interface ConfrimReceiptButtonProps {
  handleConfirmReceipt: (e: React.FormEvent) => void;
  currentRole: string;
  product: Product;
  t: any;
  index: number;
}
const ConfrimReceiptButton = ({
  handleConfirmReceipt,
  currentRole,
  product,
  t,
}: ConfrimReceiptButtonProps) => {
  return (
    <>
      {allowedRoles.includes(currentRole) &&
        product.productState === ProductState.RESERVED && (
          <Button
            size="small"
            onClick={handleConfirmReceipt}
            variant="contained"
          >
            {t(translationProductCard + "confirmReceiptButton")}
          </Button>
        )}
    </>
  );
};

export function ProductCard({
  product,
  index,
  changeVisibilityProduct,
  removeProductFromList,
  setUpdatedProduct,
}: ProductProps) {
  const [hydrated, setHydrated] = useState(false);
  const t = useAppTranslation(foodExchangeDictionary);
  const { currentRole } = useContext(UserContext);
  const [isDialogRateOpen, setIsDialogRateOpen] = useState(false);
  const [isDialogDetailsProductOpen, setIsDialogDetailsProductOpen] =
    useState(false);

  const handleOpenRatingExchangeDialog = () => {
    setIsDialogRateOpen((prev) => !prev);
  };
  const handleDetailsProductDialog = () => {
    setIsDialogDetailsProductOpen((prev) => !prev);
  };

  useEffect(() => {
    setHydrated(true);
  }, []);

  if (!hydrated) {
    return null;
  }
  const fetchProduct = async () => {
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
              snackbarTranslated(
                t(tranlationProductCardRequests + "FetchProduct.success"),
                "success"
              );
              setUpdatedProduct(index, resAxios.product);
              return;
            }
            if (resAxios.key !== undefined) {
              snackbarTranslated(
                t(
                  tranlationProductCardRequests +
                    "FetchProduct.Error." +
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
              t(tranlationProductCardRequests + "FetchProduct.Error.general"),
              "error"
            );
          });
      })
      .catch((error) => {
        snackbarTranslated(
          t(tranlationProductCardRequests + "FetchProduct.Error.general"),
          "error"
        );
      });
  };

  const manageProductVisibility = async (
    event: React.FormEvent,
    productState: ProductStateType
  ) => {
    event.preventDefault();
    const value =
      productState === ProductState.HIDDEN
        ? ProductState.VISIBLE
        : ProductState.HIDDEN;
    const redProductId = product.id;
    const path = "productState";
    const requestOptions = {
      body: JSON.stringify({
        value: value,
      }),
      headers: {
        "If-Match": product.etag,
      },
    };

    await fetchWithAuthorization(
      `${foodExchangeUrl}product/${redProductId}/${path}`,
      HTTP_PATCH,
      requestOptions
    )
      .then((res: Response) => {
        res
          .json()
          .then((resAxios) => {
            if (res.ok) {
              productState === ProductState.VISIBLE
                ? snackbarTranslated(
                    t(tranlationProductCardRequests + "Visibility.success"),
                    "success"
                  )
                : snackbarTranslated(
                    t(tranlationProductCardRequests + "Hidden.success"),
                    "success"
                  );
              changeVisibilityProduct(event, index, value as ProductStateType);
              setUpdatedProduct(index, resAxios.product);
              return;
            }
            if (resAxios.key !== undefined) {
              if (resAxios.key === "exception.outdated_data") {
                fetchProduct();
              }
              productState === ProductState.VISIBLE
                ? snackbarTranslated(
                    t(
                      tranlationProductCardRequests +
                        "Visibility.Error." +
                        resAxios.key
                    ),
                    "error"
                  )
                : snackbarTranslated(
                    t(
                      tranlationProductCardRequests +
                        "Hidden.Error." +
                        resAxios.key
                    ),
                    "error"
                  );
              return;
            }
            throw new Error();
          })
          .catch((error) => {
            productState === ProductState.VISIBLE
              ? snackbarTranslated(
                  t(tranlationProductCardRequests + "Visibility.Error.general"),
                  "error"
                )
              : snackbarTranslated(
                  t(tranlationProductCardRequests + "Hidden.Error.general"),
                  "error"
                );
          });
      })
      .catch((error) => {
        productState === ProductState.VISIBLE
          ? snackbarTranslated(
              t(tranlationProductCardRequests + "Visibility.Error.general"),
              "error"
            )
          : snackbarTranslated(
              t(tranlationProductCardRequests + "Hidden.Error.general"),
              "error"
            );
      });
  };

  const confirmReceipt = async (event: React.FormEvent) => {
    event.preventDefault();

    const redProductId = product.id;
    const path = "productState";

    const requestOptions = {
      body: JSON.stringify({
        value: ProductState.EXCHANGED,
      }),
      headers: {
        "If-Match": product.etag,
      },
    };

    await fetchWithAuthorization(
      `${foodExchangeUrl}product/${redProductId}/${path}`,
      HTTP_PATCH,
      requestOptions
    )
      .then((res: Response) => {
        res
          .json()
          .then((resAxios) => {
            if (res.ok) {
              snackbarTranslated(
                tranlationProductCardRequests + "ConfirmReceipt.success",
                "success"
              );
              setIsDialogRateOpen(true);
              return;
            }
            if (resAxios.key !== undefined) {
              if (resAxios.key === "exception.outdated_data") {
                fetchProduct();
              }
              snackbarTranslated(
                t(
                  tranlationProductCardRequests +
                    "ConfirmReceipt.Error." +
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
              t(tranlationProductCardRequests + "ConfirmReceipt.Error.general"),
              "error"
            );
          });
      })
      .catch((error) => {
        snackbarTranslated(
          t(tranlationProductCardRequests + "ConfirmReceipt.Error.general"),
          "error"
        );
      });
  };

  const removeProduct = async (event: React.FormEvent) => {
    event.preventDefault();
    const redProductId = product.id;
    const path = "/actionCancelled";
    const requestOptions = {
      body: JSON.stringify({
        value: "true",
      }),
      headers: {
        "If-Match": product.etag,
      },
    };

    await fetchWithAuthorization(
      `${foodExchangeUrl}product/${redProductId}/${path}`,
      HTTP_PATCH,
      requestOptions
    )
      .then((res: Response) => {
        res
          .json()
          .then((resAxios) => {
            if (res.ok) {
              snackbarTranslated(
                t(tranlationProductCardRequests + "RemoveProduct.success"),
                "success"
              );
              removeProductFromList(event, index);
              return;
            }
            if (resAxios.key !== undefined) {
              if (resAxios.key === "exception.outdated_data") {
                fetchProduct();
              }
              snackbarTranslated(
                t(
                  tranlationProductCardRequests +
                    "RemoveProduct.Error." +
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
              t(tranlationProductCardRequests + "RemoveProduct.Error.general"),
              "error"
            );
          });
      })
      .catch((error) => {
        snackbarTranslated(
          t(tranlationProductCardRequests + "RemoveProduct.Error.general"),
          "error"
        );
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
      key={product.id}
    >
      <CardHeader
        action={
          <>
            {visibleButton.includes(product.productState) && (
              <>
                <IconButton
                  onClick={(e) =>
                    manageProductVisibility(e, product.productState)
                  }
                >
                  {product.productState === ProductState.HIDDEN ? (
                    <VisibilityOffIcon />
                  ) : (
                    <VisibilityIcon />
                  )}
                </IconButton>
              </>
            )}
            <IconButton>
              <DeleteForeverIcon onClick={(e) => removeProduct(e)} />
            </IconButton>
          </>
        }
        titleTypographyProps={{
          style: {
            color: secondary,
          },
        }}
        title={product.name}
      ></CardHeader>
      <CardContent>
        <Grid container justifyContent="flex-start">
          <Grid container item xs={6}>
            <Grid item xs={12}>
              <Typography
                variant="body1"
                className={styles["truncated-content"]}
                style={{ wordWrap: "break-word" }}
              >
                {product.description}
              </Typography>
              <Typography variant="body1">
                {t(
                  translationProductCard +
                    "Categories." +
                    product.categories?.toLowerCase()
                )}
              </Typography>
              <Typography variant="body1">{product.expirationDate}</Typography>
              <Typography variant="body1">
                {t(
                  translationProductCard +
                    "ProductStates." +
                    product.productState
                )}
              </Typography>
            </Grid>
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
              {/* <ConfrimReceiptButton
                handleConfirmReceipt={confirmReceipt}
                currentRole={currentRole}
                product={product}
                index={index}
                t={t}
              /> */}
              <Button
                size="small"
                variant="contained"
                onClick={handleDetailsProductDialog}
              >
                {t(translationProductCard + "detailsButton")}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </CardContent>

      {isDialogDetailsProductOpen && (
        <DetailsCardProduct
          open={isDialogDetailsProductOpen}
          product={product}
          handleSetOpen={handleDetailsProductDialog}
          setUpdatedProduct={setUpdatedProduct}
          index={index}
        />
      )}
      {/* <RatingExchange
        handleSetOpen={handleOpenRatingExchangeDialog}
        open={isDialogRateOpen}
        exchangeId={product.exchangeId}
      /> */}
    </Card>
  );
}
export default ProductCard;
