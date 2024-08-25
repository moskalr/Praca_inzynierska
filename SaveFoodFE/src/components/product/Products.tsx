import CachedIcon from "@mui/icons-material/Cached";
import SearchIcon from "@mui/icons-material/Search";
import {
  Box,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  SelectChangeEvent,
  TextField,
  Typography,
} from "@mui/material";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import CategoryDisplay from "../../components/category/CategoryDisplay";
import CategorySelect from "../../components/category/CategorySelect";
import ProductCard from "../../components/product/ProductCard";
import { secondary } from "../../constants/colors";
import { HTTP_UNAUTHORIZED } from "../../constants/httpCodes";
import { HTTP_GET } from "../../constants/httpMethods";
import styles from "../../styles/product.module.css";
import { Product, ProductList } from "../../type/mzls";
import fetchWithAuthorization from "../../utils/axios/fetchWrapper";
import { Categories } from "../../utils/categories/categories";
import LoadingSpinner from "../../utils/loading_spinner/LoadingSpinner";
import snackbar from "../../utils/snackbar/snackbar";
import getProductUnit from "../../utils/unit/getProductUnit";
import openIconUrl from "/public/icons/open-fridge.png";

interface ProductsProps {
  t: Function;
}

const Products: React.FC<ProductsProps> = ({ t }) => {
  const [products, setProducts] = useState<ProductList[]>([]);
  const [searchTitle, setSearchTitle] = useState("");
  const [searchCategory, setSearchCategory] = useState<Categories | undefined>(
    undefined
  );
  const [nextPage, setNextPage] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [loadingState, setLoadingState] = useState(false);
  const router = useRouter();
  const itemsPerPage = 12;
  const [hasMore, setHasMore] = useState(true);

  const fetchProducts = async (page: number, isFiltering: boolean) => {
    const newPage = page + 1;
    const queryParams = [`size=${itemsPerPage}`, `page=${page}`];
    if (searchCategory) {
      queryParams.push(`category=${searchCategory}`);
    }
    if (searchTitle) {
      queryParams.push(`title=${searchTitle}`);
    }

    const fullPath = `/api/social-fridge/products${
      queryParams.length > 0 ? `?${queryParams.join("&")}` : ""
    }`;

    await fetchWithAuthorization(fullPath, HTTP_GET)
      .then((response) => {
        if (response.status === HTTP_UNAUTHORIZED) {
          snackbar("errors.unauthorized", "error", t);
          router.push("/login");
        }
        return response.json();
      })
      .then((data) => {
        if (data.products.length > 0 && !isFiltering) {
          setProducts([...products, ...data.products]);
          setNextPage(newPage);
          if (data.products.length < itemsPerPage) {
            setHasMore(false);
          }
        } else if (isFiltering) {
          setProducts(data.products);
          setNextPage(newPage);
          if (data.products.length < itemsPerPage) {
            setHasMore(false);
          }
        } else {
          setHasMore(false);
        }
      })
      .catch((error) => {
        snackbar("errors.product_error", "error", t);
      });

    setLoadingState(false);
  };

  const fetchProduct = async (id: number) => {
    await fetchWithAuthorization(`/api/social-fridge/product/${id}`, HTTP_GET)
      .then((response) => {
        return response.json().then((data) => {
          if (response.ok) {
            setSelectedProduct(data.product);
          } else if (response.status === HTTP_UNAUTHORIZED) {
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

  useEffect(() => {
    fetchProducts(nextPage, false);
  }, []);

  const handleSearch = () => {
    setHasMore(true);
    fetchProducts(0, true);
  };

  const openProductDetailsDialog = (productId: number) => {
    fetchProduct(productId);
    setOpenDialog(true);
  };

  const closeProductDetailsDialog = () => {
    setSelectedProduct(null);
    setOpenDialog(false);
  };

  const formatUnixTimestamp = ([year, month, day, hour, minute]: number[]) => {
    if (year !== undefined && month !== undefined) {
      const date = new Date(year, month - 1, day, hour, minute);
      return new Intl.DateTimeFormat("pl-PL").format(date);
    }
  };

  const handleOpenFridge = () => {
    if (
      selectedProduct &&
      selectedProduct.socialFridge &&
      selectedProduct.socialFridge.id
    ) {
      router.push(`/fridge/${selectedProduct.socialFridge.id}`);
    }
  };

  const handleCategoryChange = (
    event: SelectChangeEvent<Categories | undefined>
  ) => {
    const selectedCategory = event.target.value as Categories | undefined;
    setSearchCategory(selectedCategory);
  };

  const handleRefresh = () => {
    setHasMore(true);
    setNextPage(0);

    fetchProducts(0, true);
  };

  return (
    <div>
      <LoadingSpinner open={loadingState} />
      {!loadingState && (
        <Container component="main" maxWidth="xs">
          <Box className={styles["container"]}>
            <>
              <Typography className={styles["product-title"]}>
                {t("product.messages.products")}
              </Typography>

              <Box className={styles["search-section"]}>
                <TextField
                  label={t("product.search.searchPlaceholder")}
                  variant="outlined"
                  size="small"
                  value={searchTitle}
                  onChange={(e) => setSearchTitle(e.target.value)}
                  InputLabelProps={{
                    style: { color: secondary },
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                  className={styles["search-input"]}
                />

                <CategorySelect
                  categories={Object.values(Categories)}
                  value={searchCategory}
                  onChange={handleCategoryChange}
                  t={t}
                />
                <IconButton onClick={handleRefresh}>
                  <CachedIcon />
                </IconButton>
                <Button
                  onClick={handleSearch}
                  style={{
                    color: secondary,
                  }}
                  className={styles["search-button"]}
                >
                  {t("product.search.searchButton")}
                </Button>
              </Box>

              <InfiniteScroll
                dataLength={products.length}
                next={() => fetchProducts(nextPage, false)}
                hasMore={hasMore}
                loader={
                  <h4 style={{ textAlign: "center" }}>
                    {t("infiniteScroll.loading")}
                  </h4>
                }
                endMessage={
                  <p style={{ textAlign: "center" }}>
                    <b>{t("infiniteScroll.end")}</b>
                  </p>
                }
              >
                <Box className={styles["product-card-section"]}>
                  {products?.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onOpenDetails={openProductDetailsDialog}
                      t={t}
                    />
                  ))}
                </Box>
              </InfiniteScroll>

              <Dialog
                open={openDialog}
                onClose={closeProductDetailsDialog}
                aria-labelledby="product-details-dialog"
                maxWidth="sm"
                fullWidth
                className={styles["product-dialog"]}
              >
                <DialogTitle className={styles["details-title"]}>
                  {t("product.details.detailsTitle")}
                  <IconButton
                    className={styles["open-fridge-button"]}
                    onClick={handleOpenFridge}
                  >
                    <Image
                      src={openIconUrl}
                      alt="Open fridge"
                      layout="fixed"
                      width={40}
                      height={40}
                    />
                  </IconButton>
                </DialogTitle>
                <DialogContent>
                  {selectedProduct && (
                    <div>
                      <Typography variant="h6">
                        {selectedProduct.title}
                      </Typography>
                      <CategoryDisplay
                        categories={selectedProduct.categories}
                        message={t("product.details.categoryLabel")}
                        t={t}
                      />
                      <Typography variant="body2">
                        {t("product.details.expirationDate")}
                        {formatUnixTimestamp(selectedProduct.expirationDate)}
                      </Typography>
                      <Typography variant="body2">
                        {t("product.details.size")} {selectedProduct.size}{" "}
                        {getProductUnit(selectedProduct.productUnit)}
                      </Typography>
                      <Typography variant="body2">
                        {t("product.details.description")}
                        {selectedProduct.description}
                      </Typography>
                    </div>
                  )}
                </DialogContent>
                <DialogActions>
                  <Button onClick={closeProductDetailsDialog} color="secondary">
                    {t("product.details.closeButton")}
                  </Button>
                </DialogActions>
              </Dialog>
            </>
          </Box>
        </Container>
      )}
    </div>
  );
};

export default Products;
