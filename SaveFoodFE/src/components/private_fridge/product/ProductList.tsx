import FastfoodIcon from "@mui/icons-material/Fastfood";
import FilterListIcon from "@mui/icons-material/FilterList";
import Inventory2RoundedIcon from "@mui/icons-material/Inventory2Rounded";
import SearchIcon from "@mui/icons-material/Search";
import TakeoutDiningRoundedIcon from "@mui/icons-material/TakeoutDiningRounded";
import TuneIcon from "@mui/icons-material/Tune";
import { Grid, TableContainer, Typography } from "@mui/material";
import Collapse from "@mui/material/Collapse";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import InputBase from "@mui/material/InputBase";
import Paper from "@mui/material/Paper";
import TableCell from "@mui/material/TableCell";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import { useTranslation } from "next-i18next";
import { useState } from "react";
import {
  UserRole,
  permissions,
} from "../../../utils/pf_permissions/pf_permissions";
import useProductData from "../../../utils/custom_hook/useProductData";
import {
  filterCategories,
  sortingOptions,
} from "../../../utils/filter_options/pf_options";
import DateTimeDisplay from "../DateTimeDisplay";
import FilterButton from "../filter/FilterButton";
import { DropDownButton } from "../useFrom/DropDownButton";
import AddProduct from "./AddProduct";
import TakeOutProduct from "./TakeOutProduct";

const dictionary = "private_fridge";

interface Props {
  fridgeId: number;
  userRole: UserRole;
}

export function ProductList({ userRole, fridgeId }: Props) {
  const { t } = useTranslation(dictionary);
  const [isProductListOpen, setProductListOpen] = useState(false);
  const canAddProduct = permissions["canAddProduct"]?.includes(userRole);
  const canTakeOutProduct =
    permissions["canTakeOutProduct"]?.includes(userRole);

  const [paginationParams, setPaginationParams] =
    useState<ProductPagginationParams>({
      page: 0,
      size: 12,
      productSortingType: "DESC_CREATION_DATE",
      productCategory: "",
      name: "",
    });

  const handleChangePage = (event: unknown, newPage: number) => {
    setPaginationParams((prevParams) => ({
      ...prevParams,
      page: newPage,
    }));
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newSize = parseInt(event.target.value, 10);
    setPaginationParams((prevParams) => ({
      ...prevParams,
      size: newSize,
      page: 0,
    }));
  };

  const { products, numberOfProducts } = useProductData(
    fridgeId,
    paginationParams,
    t
  );

  return (
    <>
      <TableRow
        sx={{ "& > *": { borderBottom: "unset", width: "100vw" } }}
        hover
      >
        <TableCell sx={{ maxWidth: "5vw" }}>
          <DropDownButton
            isListOpen={isProductListOpen}
            setListOpen={setProductListOpen}
          />
        </TableCell>
        <TableCell width={"90vw"}>
          <Typography>{t("products.title")}</Typography>
        </TableCell>
        {canAddProduct && (
          <TableCell sx={{ maxWidth: "5vw" }}>
            <AddProduct fridgeId={fridgeId} />
          </TableCell>
        )}
      </TableRow>

      <Collapse in={isProductListOpen} timeout="auto" unmountOnExit>
        <form>
          <Paper sx={{ width: "100%", overflow: "hidden" }}>
            <Paper
              component="form"
              sx={{
                p: "2px 4px",
                display: "flex",
                alignItems: "center",
                width: "100%",
              }}
            >
              <InputBase
                sx={{ ml: 1, flex: 1 }}
                placeholder={t(`filter.search_name`)}
                onChange={(event) => {
                  const newName = event.target.value;
                  setPaginationParams({
                    ...paginationParams,
                    name: newName,
                  });
                }}
              />
              <FilterButton
                filterOptions={filterCategories}
                icon={<TuneIcon />}
                selectedValue={paginationParams.productCategory}
                filterChangeHandler={(option) =>
                  setPaginationParams((prevParams) => ({
                    ...prevParams,
                    productCategory: option,
                  }))
                }
                title={t(`filter.fiter_title`)}
              />
              <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />
              <FilterButton
                filterOptions={sortingOptions}
                icon={<FilterListIcon />}
                selectedValue={paginationParams.productSortingType}
                filterChangeHandler={(option) =>
                  setPaginationParams((prevParams) => ({
                    ...prevParams,
                    productSortingType: option,
                  }))
                }
                title={t(`filter.sort_title`)}
              />

              <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />
              <IconButton sx={{ p: "10px" }} aria-label="search">
                <SearchIcon />
              </IconButton>
            </Paper>
            <TableContainer>
              <Grid container spacing={4} sx={{ paddingTop: "25px" }}>
                {products.length === 0 ? (
                  <Paper
                    sx={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Typography variant="subtitle1" component="div">
                      {t("products.empty_list")}
                    </Typography>
                  </Paper>
                ) : (
                  products.map((product) => (
                    <Grid
                      item
                      xs={12}
                      sm={12}
                      md={6}
                      lg={4}
                      xl={3}
                      key={product.id}
                    >
                      <Paper sx={{ width: "100%", backgroundColor: "#EBEFED" }}>
                        <Grid container rowSpacing={2}>
                          {product.opened ? (
                            <TakeoutDiningRoundedIcon
                              sx={{
                                marginTop: "5px",
                                marginLeft: "5px",
                                color: "darkred",
                              }}
                            />
                          ) : (
                            <Inventory2RoundedIcon
                              sx={{
                                marginTop: "5px",
                                marginLeft: "5px",
                                color: "darkgreen",
                              }}
                            />
                          )}
                          <Grid item>
                            {!product.image ? (
                              <FastfoodIcon
                                sx={{
                                  width: "150px",
                                  height: "150px",
                                }}
                              />
                            ) : (
                              <img
                                src={product.image}
                                style={{
                                  width: "150px",
                                  height: "150px",
                                  marginRight: "5px",
                                }}
                              />
                            )}
                          </Grid>
                          <Grid xs={12} item sm container>
                            <Grid
                              item
                              xs
                              container
                              direction="column"
                              spacing={2}
                            >
                              <Grid item xs>
                                <Grid>
                                  <Typography
                                    gutterBottom
                                    variant="subtitle1"
                                    component="div"
                                  >
                                    {product.name}
                                  </Typography>
                                </Grid>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  {t("products.category_title")}
                                  {t(
                                    `products.category.${product.productCategory}`.toLowerCase()
                                  )}
                                </Typography>

                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  {t("products.expiration_date_title")}
                                  <DateTimeDisplay
                                    dateString={product.expirationDate}
                                    withTime={false}
                                  />
                                </Typography>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  {product.opened && (
                                    <>
                                      {t(
                                        "products.form.shelf_life_after_opening"
                                      )}
                                      {": "}
                                      {product.daysToEat}
                                      {t("products.form.days")}
                                    </>
                                  )}
                                </Typography>
                                <Typography
                                  gutterBottom
                                  variant="subtitle1"
                                  component="div"
                                >
                                  {product.quantity}
                                  {product.unitOfMeasure === "GRAMS"
                                    ? "g"
                                    : "ml"}
                                </Typography>
                              </Grid>
                            </Grid>
                            <Grid item>
                              {canTakeOutProduct && (
                                <TakeOutProduct
                                  productId={product.id}
                                  currentQuentity={product.quantity}
                                />
                              )}
                            </Grid>
                          </Grid>
                          <Grid item xs={12}>
                            <Typography
                              variant="body2"
                              gutterBottom
                              sx={{ margin: "10px" }}
                            >
                              {product.description}
                            </Typography>
                          </Grid>
                        </Grid>
                      </Paper>
                    </Grid>
                  ))
                )}
              </Grid>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[6, 12, 24]}
              component="div"
              count={numberOfProducts}
              rowsPerPage={paginationParams.size}
              page={paginationParams.page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage={t("products.rows_per_page")}
            />
          </Paper>
        </form>
      </Collapse>
    </>
  );
}
