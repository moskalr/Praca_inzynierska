import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import {
  Button,
  Card,
  CardActions,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  Grid,
  Typography,
} from "@mui/material";
import Checkbox from "@mui/material/Checkbox";
import Image from "next/image";
import router from "next/router";
import { useState } from "react";
import { secondary } from "../../constants/colors";
import { HTTP_UNAUTHORIZED } from "../../constants/httpCodes";
import { HTTP_GET } from "../../constants/httpMethods";
import {
  ARCHIVED_BY_SYSTEM,
  ARCHIVED_BY_USER,
} from "../../constants/productState";
import styles from "../../styles/product.module.css";
import { Product, ProductList } from "../../type/mzls";
import fetchWithAuthorization from "../../utils/axios/fetchWrapper";
import snackbar from "../../utils/snackbar/snackbar";
import getProductUnit from "../../utils/unit/getProductUnit";
import CategoryDisplay from "../category/CategoryDisplay";

interface DeleteProductProps {
  products: ProductList[];
  selectedProductIds: number[];
  onProductCheckboxChange: (productId: number) => void;
  t: Function;
}

function DeleteProduct({
  products,
  selectedProductIds,
  onProductCheckboxChange,
  t,
}: DeleteProductProps) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const openProductDetailsDialog = async (product: ProductList) => {
    await fetchWithAuthorization(
      `/api/social-fridge/product/${product.id}`,
      HTTP_GET
    )
      .then((response) => {
        return response.json().then((data) => {
          if (response.ok) {
            setSelectedProduct(data.product);
            setIsDialogOpen(true);
          } else if (response.status === HTTP_UNAUTHORIZED) {
            setIsDialogOpen(false);
            snackbar("errors.unauthorized", "error", t);
            router.push("/login");
          } else if (data.error.key !== undefined) {
            snackbar(`errors.${data.error.key}`, "error", t);
          }
        });
      })
      .catch(() => {
        snackbar("errors.rating_error", "error", t);
      });
  };

  const closeProductDetailsDialog = () => {
    setIsDialogOpen(false);
    setSelectedProduct(null);
  };

  const formatUnixTimestamp = ([year, month, day, hour, minute]: number[]) => {
    if (year !== undefined && month !== undefined) {
      const date = new Date(year, month - 1, day, hour, minute);
      return new Intl.DateTimeFormat("pl-PL").format(date);
    }
  };

  return (
    <div className={styles["product-grid"]}>
      {products
        .filter(
          (product) =>
            product.state !== ARCHIVED_BY_SYSTEM &&
            product.state !== ARCHIVED_BY_USER
        )
        .map((product: ProductList) => (
          <Card key={product.id} className={styles["card-component"]}>
            <div style={{ display: "flex" }}>
              {product.image !== null && (
                <Image
                  src={product.image}
                  alt={product.title}
                  layout="fixed"
                  width={110}
                  height={110}
                  unoptimized
                />
              )}

              <CardContent>
                <Typography
                  className={styles["card-title"]}
                  variant="h6"
                  gutterBottom
                >
                  {product.title}
                </Typography>
                <CategoryDisplay
                  categories={product.categories}
                  message={t("categoryLabel")}
                  t={t}
                />
              </CardContent>
            </div>

            <CardActions>
              <Grid container alignItems="center">
                <Button
                  size="small"
                  onClick={() => {
                    openProductDetailsDialog(product);
                  }}
                  style={{ color: secondary }}
                >
                  {t("fridge.details.detailsTitle")}
                </Button>
                <DeleteForeverIcon style={{ marginLeft: "5px" }} />
                <span>{t("fridge.messages.delete")}</span>
                <Checkbox
                  checked={selectedProductIds.includes(product.id)}
                  onChange={() => onProductCheckboxChange(product.id)}
                  style={{
                    color: selectedProductIds.includes(product.id)
                      ? secondary
                      : "inherit",
                  }}
                />
              </Grid>
            </CardActions>
          </Card>
        ))}

      <Dialog
        open={isDialogOpen}
        onClose={closeProductDetailsDialog}
        aria-labelledby="product-details-dialog"
        maxWidth="sm"
        fullWidth
        className={styles["product-dialog"]}
      >
        <DialogContent>
          {selectedProduct && (
            <div>
              <Typography variant="h6">{selectedProduct.title}</Typography>
              <CategoryDisplay
                categories={selectedProduct.categories}
                message={t("categoryLabel")}
                t={t}
              />
              <Typography variant="body2">
                {t("fridge.details.expirationDate")}
                {selectedProduct !== null
                  ? formatUnixTimestamp(selectedProduct.expirationDate)
                  : null}
              </Typography>
              <Typography variant="body2">
                {t("fridge.details.size")} {selectedProduct.size}
                {getProductUnit(selectedProduct.productUnit)}
              </Typography>
              <Typography variant="body2">
                {t("fridge.details.description")} {selectedProduct.description}
              </Typography>
            </div>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeProductDetailsDialog} color="secondary">
            {t("fridge.details.closeButton")}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default DeleteProduct;
