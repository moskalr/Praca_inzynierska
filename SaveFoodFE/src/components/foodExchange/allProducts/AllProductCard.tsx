import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
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
import {
  CLIENT_ADMIN,
  CLIENT_MODERATOR,
  CLIENT_USER,
} from "../../../constants/roles";
import { foodExchangeUrl } from "../../../constants/url/foodExchange";
import { Product, ProductState, ProductStateType } from "../../../type/mzwz";
import fetchWithAuthorization from "../../../utils/axios/fetchWrapper";
import snackbarTranslated from "../../../utils/snackbar/snackbarTranslated";
import { useAppTranslation } from "../../../utils/translation/translationWrapper";
import { UserContext } from "../../context/UserContextProvider";
import DetailsCardProduct from "../cards/DetailsCardProduct";
import ReserveProduct from "../reserveProductStepper/ReserveProduct";

const translation = "Tabs.AllProducts.AllProductCard.";
const translationProductCard = "Tabs.ProductCard.";
const translationRequests = "Tabs.AllProducts.Requests.";
const allowsDeleteProductRoles = [CLIENT_ADMIN, CLIENT_MODERATOR];
const allowsReserveProductRoles = [CLIENT_USER];
const visibleButton = [
  ProductState.VISIBLE,
  ProductState.HIDDEN,
] as ProductStateType[];

interface ProductProps {
  product: Product;
  index: number;
  removeProductFromList: {
    (e: React.FormEvent, index: number): void;
  };
  setUpdatedProduct: { (index: number, changedProduct: Product): void };
}

const RemoveProductButton = ({
  currentRole,
  removeProduct,
}: {
  currentRole: string;
  removeProduct: (event: React.FormEvent) => void;
}) => {
  if (!allowsDeleteProductRoles.includes(currentRole)) {
    return <> </>;
  }
  return (
    <IconButton>
      <DeleteForeverIcon onClick={(e) => removeProduct(e)} />
    </IconButton>
  );
};

const ReservationButton = ({
  index,
  setUpdatedProduct,
  currentRole,
  handleTogleStepper,
  isStepperOpen,
  product,
  t,
}: {
  index: number;
  setUpdatedProduct: { (index: number, changedProduct: Product): void };
  currentRole: string;
  handleTogleStepper: () => void;
  isStepperOpen: boolean;
  product: Product;
  t: any;
}) => {
  if (!allowsReserveProductRoles.includes(currentRole)) {
    return <> </>;
  }
  return (
    <>
      <Button
        onClick={handleTogleStepper}
        size="small"
        variant="contained"
        disabled={product.productState === ProductState.RESERVED}
      >
        {t(translationProductCard + "reserveButton")}
      </Button>
      {isStepperOpen && (
        <ReserveProduct
          index={index}
          setUpdatedProduct={setUpdatedProduct}
          open={isStepperOpen}
          onClose={handleTogleStepper}
          product={product}
        />
      )}
    </>
  );
};

export function AllProductCard({
  product,
  index,
  removeProductFromList,
  setUpdatedProduct,
}: ProductProps) {
  const [isDialogDetailsProductOpen, setIsDialogDetailsProductOpen] =
    useState(false);
  const [hydrated, setHydrated] = useState(false);
  const t = useAppTranslation(foodExchangeDictionary);
  const [isStepperOpen, setIsStepperOpen] = useState(false);
  const { currentRole } = useContext(UserContext);
  const handleDetailsProductDialog = () => {
    setIsDialogDetailsProductOpen((prev) => !prev);
  };
  useEffect(() => {
    setHydrated(true);
  }, []);

  if (!hydrated) {
    return null;
  }

  const handleTogleStepper = () => {
    setIsStepperOpen((prev) => !prev);
  };

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
                t(translationRequests + "FetchProduct.success"),
                "success"
              );
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
                t(translationRequests + "RemoveProduct.success"),
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
                t(translationRequests + "RemoveProduct.Error." + resAxios.key),
                "error"
              );
              return;
            }
            throw new Error();
          })
          .catch((error) => {
            snackbarTranslated(
              t(translationRequests + "RemoveProduct.Error.general"),
              "error"
            );
          });
      })
      .catch((error) => {
        snackbarTranslated(
          t(translationRequests + "RemoveProduct.Error.general"),
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
              <RemoveProductButton
                currentRole={currentRole}
                removeProduct={removeProduct}
              />
            )}
          </>
        }
        style={{ color: secondary }}
        title={product.name}
      ></CardHeader>
      <CardContent>
        <Grid container justifyContent="flex-start">
          <Grid item xs={6}>
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
              <ReservationButton
                setUpdatedProduct={setUpdatedProduct}
                index={index}
                currentRole={currentRole}
                handleTogleStepper={handleTogleStepper}
                isStepperOpen={isStepperOpen}
                product={product}
                t={t}
              />
              <Button
                sx={{ marginTop: 1 }}
                size="small"
                variant="contained"
                onClick={handleDetailsProductDialog}
              >
                {t(translationProductCard + "detailsButton")}
              </Button>
            </Box>
          </Grid>
          {isDialogDetailsProductOpen && (
            <DetailsCardProduct
              product={product}
              setUpdatedProduct={setUpdatedProduct}
              index={index}
              open={isDialogDetailsProductOpen}
              handleSetOpen={handleDetailsProductDialog}
            />
          )}
        </Grid>
      </CardContent>
    </Card>
  );
}
export default AllProductCard;
