import CachedIcon from "@mui/icons-material/Cached";
import ClearIcon from "@mui/icons-material/Clear";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import SearchIcon from "@mui/icons-material/Search";
import {
  Autocomplete,
  Button,
  Chip,
  Grid,
  Grow,
  IconButton,
  InputAdornment,
  TextField,
} from "@mui/material";
import Cookies from "js-cookie";
import React, { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import InfiniteScroll from "react-infinite-scroll-component";
import { GridTextItem } from "../../../UIcomponents/gridTextItem";
import { secondary } from "../../../constants/colors";
import { foodExchangeDictionary } from "../../../constants/dictionary";
import { HTTP_GET, HTTP_PUT } from "../../../constants/httpMethods";
import { CLIENT_ADMIN, CLIENT_MODERATOR } from "../../../constants/roles";
import { foodExchangeUrl } from "../../../constants/url/foodExchange";
import { TOKEN } from "../../../constants/variables";
import {
  FavouriteCategories,
  Product,
  ProductCategory,
  ProductProduction,
  ProductionType,
  productCategoriesKeys,
  productProductionType,
} from "../../../type/mzwz";
import fetchWithAuthorization from "../../../utils/axios/fetchWrapper";
import LoadingState from "../../../utils/loading_spinner/LoadingSpinner";
import { paginationSizeList } from "../../../utils/pagination/PaginatinSizeList";
import snackbarTranslated from "../../../utils/snackbar/snackbarTranslated";
import { UserContext } from "../../context/UserContextProvider";
import EndMessage from "../infinityScroll/EndMessage";
import AllProductCard from "./AllProductCard";

export function AllProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const { t } = useTranslation(foodExchangeDictionary);
  const [favCategories, setFavCategories] = useState<FavouriteCategories>();
  const itemsPerPage = paginationSizeList();
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [noItems, setNoItems] = useState(false);
  const [value, setValue] = useState<ProductCategory[]>([]);
  const [isFilterActive, setIsFilterActive] = useState(true);
  const token = Cookies.get(TOKEN);
  const [loading, setLoading] = useState(false);
  const translation = "Tabs.AllProducts.";
  const translationRequest = "Tabs.AllProducts.Requests.";
  const [searchTitle, setSearchTitle] = useState("");
  const [productionType, setProductionType] = useState<ProductProduction>();
  const [searchCategories, setSearchCategories] = useState<ProductCategory[]>(
    []
  );
  const { currentRole } = useContext(UserContext);
  type GridProps = Parameters<typeof Grid>[0];
  useEffect(() => {
    fetchProducts();
    if (token) {
      handleGetFavCategories();
    }
  }, []);
  const [animatedIndex, setAnimatedIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimatedIndex((prevIndex) =>
        prevIndex < products.length - 1 ? prevIndex + 1 : prevIndex
      );
    }, 1500 * animatedIndex);

    return () => clearInterval(interval);
  }, [products]);

  const handleRefresh = async (
    searchCategories: ProductCategory[],
    searchTitle: string,
    productionType: ProductProduction | undefined
  ) => {
    setHasMore(true);
    setPage(0);
    setProducts([]);
    handleFilter(searchCategories, searchTitle, productionType);
  };

  const fetchHidden = function () {
    if (currentRole == CLIENT_ADMIN || currentRole == CLIENT_MODERATOR) {
      {
        return true;
      }
    }
    return false;
  };
  const fetchProducts = async () => {
    const queryParams = new URLSearchParams();
    queryParams.append("size", String(itemsPerPage));
    queryParams.append("page", String(page));
    queryParams.append("hidden", String(fetchHidden()));
    setPage((prev) => prev + 1);
    setLoading(true);

    await fetchWithAuthorization(
      `${foodExchangeUrl}product/products?${queryParams.toString()}`,
      HTTP_GET
    )
      .then((res) => {
        res
          .json()
          .then((resAxios) => {
            setProducts([...products, ...resAxios.products]);
            if (resAxios.products?.length < itemsPerPage) {
              setHasMore(false);
              if (resAxios.products.length === 0 && page === 0) {
                setNoItems(true);
              }
            }
            setLoading(false);
          })
          .catch((error) => {
            setHasMore(false);
            setLoading(false);
            snackbarTranslated(
              t(translationRequest + "FetchProduct.Error.general"),
              "error"
            );
          });
      })
      .catch((error) => {
        setLoading(false);
        snackbarTranslated(
          t(translationRequest + "FetchProduct.Error.general"),
          "error"
        );
      });
  };

  const handleGetFavCategories = async () => {
    await fetchWithAuthorization(`${foodExchangeUrl}fav-category`, HTTP_GET)
      .then((res) => {
        res
          .json()
          .then((resAxios) => {
            setFavCategories(resAxios.favCategories);
          })
          .catch((error) => {
            snackbarTranslated(
              t(translationRequest + "FetchFavCategories.Error.general"),
              "error"
            );
          });
      })
      .catch((error) => {
        snackbarTranslated(
          t(translationRequest + "FetchFavCategories.Error.general"),
          "error"
        );
      });
  };

  const clearSearch = async () => {
    setSearchTitle("");
    setSearchCategories([]);
    setProductionType(undefined);
    setIsFilterActive(true);
    setValue([]);
    handleFilter([], "", undefined);
  };
  const handleFilter = async (
    searchCategories: ProductCategory[],
    searchTitle: string,
    productionType: ProductProduction | undefined
  ) => {
    const queryParams = new URLSearchParams();
    setPage(0);
    if (searchCategories.length != 0) {
      queryParams.append(
        "categories",
        searchCategories.map((category) => category).join(",")
      );
    }
    if (searchTitle.length != 0) {
      queryParams.append("searchName", searchTitle);
    }
    if (productionType != undefined) {
      if (productionType == ProductionType.HOMEMADE) {
        queryParams.append("homemade", "true");
      }
      if (productionType != ProductionType.HOMEMADE) {
        queryParams.append("purchased", "true");
      }
    }
    queryParams.append("hidden", String(fetchHidden()));

    await fetchWithAuthorization(
      `${foodExchangeUrl}product/products?${queryParams.toString()}`,
      HTTP_GET
    )
      .then((res) => {
        res
          .json()
          .then((resAxios) => {
            resAxios.products.length === 0 && page === 0
              ? setNoItems(true)
              : setNoItems(false);
            setProducts(resAxios.products);
          })
          .catch((error) => {
            setHasMore(false);
            snackbarTranslated(
              t(translationRequest + "FetchProduct.Error.general"),
              "error"
            );
          });
      })
      .catch((error) => {
        snackbarTranslated(
          t(translationRequest + "FetchProduct.Error.general"),
          "error"
        );
      });
  };

  const manageFavouriteCategories = async (category: ProductCategory) => {
    favCategories?.categories.includes(category)
      ? favCategories.categories.splice(
          favCategories.categories.indexOf(category),
          1
        )
      : favCategories?.categories.push(category);
    const requestOptions = {
      body: JSON.stringify({ categories: favCategories?.categories }),
    };

    await fetchWithAuthorization(
      `${foodExchangeUrl}fav-category`,
      HTTP_PUT,
      requestOptions
    )
      .then((res) => {
        res
          .json()
          .then((resAxios) => {
            if (res.ok) {
              setFavCategories(resAxios.favCategories);
              snackbarTranslated(
                t(translationRequest + "ManageFavCategories.success"),
                "success"
              );
              return;
            }
            if (resAxios.key !== undefined) {
              snackbarTranslated(
                t(
                  translationRequest +
                    "ManageFavCategories.Error." +
                    resAxios.key
                ),
                "error"
              );
              return;
            }
            throw new Error();
          })
          .catch((error) => {
            setHasMore(false);
            snackbarTranslated(
              t(translationRequest + "ManageFavCategories.Error.general"),
              "error"
            );
          });
      })
      .catch((error) => {
        snackbarTranslated(
          t(translationRequest + "FetchFavCategories.Error.general"),
          "error"
        );
      });
  };

  const setUpdatedProduct = (index: number, changedProduct: Product) => {
    setProducts((prev) => {
      prev[index] = changedProduct;
      return [...prev];
    });
  };

  const removeProductFromList = (event: React.FormEvent, index: number) => {
    setProducts((prev) => {
      if (prev.length === 1 || prev.length === 0) {
        setNoItems(true);
      }
      prev.splice(index, 1);
      return [...prev];
    });
  };

  return (
    <>
      <Grid container spacing={1}>
        <Grid
          container
          item
          xs={12}
          marginLeft={4}
          marginTop={4}
          marginRight={2}
          justifyContent={"center"}
          spacing={1}
          alignItems={"flex-start"}
        >
          <Grid item xs={12} sm={12} md={5} lg={4} xl={3} marginRight={1}>
            <TextField
              type="search"
              label={t(translation + "SearchByName.label")}
              placeholder={t(translation + "SearchByName.placeholder")}
              size="medium"
              fullWidth
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
            />
          </Grid>
          <Grid item xs={12} sm={12} md={6} lg={4} xl={3}>
            <Autocomplete
              multiple
              options={productCategoriesKeys}
              getOptionLabel={(option) =>
                t(translation + "Categories." + option.toLowerCase())
              }
              filterSelectedOptions
              value={value}
              onChange={(event, newValues) => {
                setValue(newValues);
                setSearchCategories(newValues);
                setIsFilterActive(true);
              }}
              renderOption={(props, option, { selected }) => (
                <Grid container alignItems="center" {...(props as GridProps)}>
                  <Grid item xs={11}>
                    <GridTextItem
                      text={t(
                        translation + "Categories." + option.toLowerCase()
                      )}
                      typographyProps={{ variant: "body1" }}
                    />
                  </Grid>
                  {token && (
                    <Grid item xs={1}>
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation();
                          manageFavouriteCategories(option);
                        }}
                      >
                        {favCategories?.categories.includes(option) ? (
                          <FavoriteIcon color="secondary" />
                        ) : (
                          <FavoriteBorderIcon />
                        )}
                      </IconButton>
                    </Grid>
                  )}
                </Grid>
              )}
              renderInput={(params) => (
                <>
                  <Grid container alignItems="flex-start">
                    <Grid item xs={10} sm={11} md={11} lg={11} xl={11.25}>
                      <TextField
                        {...params}
                        label={t(translation + "FilterCategory.label")}
                        placeholder={t(
                          translation + "FilterCategory.placeholder"
                        )}
                        InputLabelProps={{
                          style: { color: secondary },
                        }}
                      />
                    </Grid>
                    {token && (
                      <Grid item xs={2} sm={1} md={1} lg={1} xl={0.75}>
                        {isFilterActive ? (
                          <IconButton
                            onClick={(e) => {
                              setSearchCategories(favCategories!.categories);
                              setValue(favCategories!.categories);
                              setIsFilterActive(!isFilterActive);
                            }}
                          >
                            <FavoriteBorderIcon fontSize="large" />
                          </IconButton>
                        ) : (
                          <IconButton
                            onClick={(e) => {
                              setSearchCategories([]);
                              setValue([]);
                              setIsFilterActive(!isFilterActive);
                            }}
                            color="secondary"
                          >
                            <FavoriteIcon fontSize="large" />
                          </IconButton>
                        )}
                      </Grid>
                    )}
                  </Grid>
                </>
              )}
            />
          </Grid>
          <Grid item>
            {productProductionType.map((type) => (
              <Grid item xs={12}>
                <Chip
                  key={type}
                  sx={{
                    mr: 0.5,
                    ml: 1.5,
                    mb: 1,
                  }}
                  size="small"
                  label={t(
                    translation + "ProductProductionType." + type.toLowerCase()
                  )}
                  variant={productionType == type ? "filled" : "outlined"}
                  color={productionType ? "secondary" : "default"}
                  onClick={(e) => {
                    setProductionType((prev) =>
                      prev == type ? undefined : type
                    );
                  }}
                />
              </Grid>
            ))}
          </Grid>
          <Grid item xs={"auto"}>
            <IconButton onClick={(e) => clearSearch()}>
              <ClearIcon fontSize="large" />
            </IconButton>
            <IconButton
              onClick={(e) =>
                handleRefresh(searchCategories, searchTitle, productionType)
              }
            >
              <CachedIcon fontSize="large" />
            </IconButton>
            <Button
              style={{
                color: secondary,
              }}
              size="large"
              onClick={(e) =>
                handleFilter(searchCategories, searchTitle, productionType)
              }
            >
              {t(translation + "searchButton")}
            </Button>
          </Grid>
        </Grid>
        <Grid item xs={12}>
          <InfiniteScroll
            dataLength={products.length}
            next={() =>
              handleFilter(searchCategories, searchTitle, productionType)
            }
            hasMore={hasMore}
            loader={<LoadingState open={loading} />}
            endMessage={
              <EndMessage
                noItems={noItems}
                loading={loading}
                noItemsMessage={t(translation + "InfinityScroll.noItems")}
                noMoreProducts={t(
                  translation + "InfinityScroll.noMoreProducts"
                )}
              />
            }
          >
            <Grid item container spacing={0.5}>
              {products?.map((product, index) => (
                <Grow
                  key={product.id}
                  timeout={500}
                  in={index <= animatedIndex}
                >
                  <Grid item xs={12} sm={12} md={6} lg={4} xl={3}>
                    <AllProductCard
                      product={product}
                      index={index}
                      removeProductFromList={removeProductFromList}
                      setUpdatedProduct={setUpdatedProduct}
                    />
                  </Grid>
                </Grow>
              ))}
            </Grid>
          </InfiniteScroll>
        </Grid>
      </Grid>
    </>
  );
}

export default AllProductList;
