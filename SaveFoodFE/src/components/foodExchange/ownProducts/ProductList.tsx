import { Grid, Grow, useTheme } from "@mui/material";
import React, { useContext, useEffect, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { UserContext } from "../../../components/context/UserContextProvider";
import { foodExchangeDictionary } from "../../../constants/dictionary";
import { HTTP_GET } from "../../../constants/httpMethods";
import { foodExchangeUrl } from "../../../constants/url/foodExchange";
import { Product, ProductStateType } from "../../../type/mzwz";
import fetchWithAuthorization from "../../../utils/axios/fetchWrapper";
import LoadingState from "../../../utils/loading_spinner/LoadingSpinner";
import { paginationSizeList } from "../../../utils/pagination/PaginatinSizeList";
import snackbarTranslated from "../../../utils/snackbar/snackbarTranslated";
import { useAppTranslation } from "../../../utils/translation/translationWrapper";
import EndMessage from "../infinityScroll/EndMessage";
import ProductCard from "./ProductCard";

export function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const t = useAppTranslation(foodExchangeDictionary);
  const { usernameAccount } = useContext(UserContext);
  const theme = useTheme();
  const [hasMore, setHasMore] = useState(true);
  const [noItems, setNoItems] = useState(false);
  const itemsPerPage = paginationSizeList();
  const [page, setPage] = useState(0);
  const [removedIndex, setRemovedIndex] = useState(-9999);
  const [loading, setLoading] = useState(true);
  const translation = "Tabs.OwnProducts.";

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    const queryParams = new URLSearchParams();
    queryParams.append("accountUsername", usernameAccount);
    queryParams.append("size", String(itemsPerPage));
    queryParams.append("page", String(page));
    setPage((prev) => prev + 1);

    await fetchWithAuthorization(
      `${foodExchangeUrl}product/products?${queryParams.toString()}`,
      HTTP_GET
    )
      .then((res) => {
        res
          .json()
          .then((resAxios) => {
            setProducts([...products, ...resAxios.products]);
            if (resAxios.products.length < itemsPerPage) {
              setHasMore(false);
              if (resAxios.products.length === 0 && page === 0) {
                setNoItems(true);
              }
            }
            setLoading(false);
          })
          .catch((error) => {
            setLoading(false);
            setHasMore(false);
          });
      })
      .catch((error) => {
        setLoading(false);
        snackbarTranslated(t("somethingWentWrong"), "error");
      });
  };

  const [animatedIndex, setAnimatedIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimatedIndex((prevIndex) =>
        prevIndex < products.length - 1 ? prevIndex + 1 : prevIndex
      );
    }, 200 * animatedIndex);

    return () => clearInterval(interval);
  }, [products]);

  const changeVisibilityProduct = (
    event: React.FormEvent,
    index: number,
    value: ProductStateType
  ) => {
    setProducts((prev) => {
      prev[index]!.productState = value;
      return [...prev];
    });
  };

  const removeProductFromList = (event: React.FormEvent, index: number) => {
    setRemovedIndex(index);
    setProducts((prev) => {
      if (prev.length === 1 || prev.length === 0) {
        setNoItems(true);
      }
      prev.splice(index, 1);
      return [...prev];
    });
  };

  const setUpdatedProduct = (index: number, changedProduct: Product) => {
    setProducts((prev) => {
      prev[index] = changedProduct;
      return [...prev];
    });
  };

  return (
    <InfiniteScroll
      dataLength={products.length}
      next={fetchProducts}
      hasMore={hasMore}
      loader={<LoadingState open={loading} />}
      endMessage={
        <EndMessage
          noItems={noItems}
          loading={loading}
          noItemsMessage={t(translation + "InfinityScroll.noItems")}
          noMoreProducts={t(translation + "InfinityScroll.noMoreProducts")}
        />
      }
    >
      <Grid container spacing={0.5}>
        {products.map((product, index) => (
          <Grow key={product.id} timeout={500} in={index <= animatedIndex}>
            <Grid item xs={12} sm={12} md={6} lg={4} xl={3} key={product.id}>
              <ProductCard
                product={product}
                index={index}
                key={product.id}
                removeProductFromList={removeProductFromList}
                changeVisibilityProduct={changeVisibilityProduct}
                setUpdatedProduct={setUpdatedProduct}
              />
            </Grid>
          </Grow>
        ))}
      </Grid>
    </InfiniteScroll>
  );
}

export default ProductList;
