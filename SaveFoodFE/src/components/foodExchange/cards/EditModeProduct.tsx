import ClearIcon from "@mui/icons-material/Clear";
import SaveIcon from "@mui/icons-material/Save";
import {
  FormControl,
  Grid,
  IconButton,
  MenuItem,
  Rating,
  Select,
  Typography,
  TypographyVariant,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import FormControlLabel from "@mui/material/FormControlLabel";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import TextField from "@mui/material/TextField";
import { LocalizationProvider, MobileTimePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { Divider } from "@nextui-org/react";
import dayjs from "dayjs";
import { i18n } from "next-i18next";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import Modal from "react-modal";
import mapStyles from "~/styles/foodExchange.module.css";
import { GridTextItem } from "../../../UIcomponents";
import Map from "../../../components/map";
import { foodExchangeDictionary } from "../../../constants/dictionary";
import { HTTP_GET, HTTP_PUT } from "../../../constants/httpMethods";
import { foodExchangeUrl } from "../../../constants/url/foodExchange";
import {
  CreateProductType,
  Product,
  ProductionType,
  productCategoriesKeys,
} from "../../../type/mzwz";
import fetchWithAuthorization from "../../../utils/axios/fetchWrapper";
import LoadingState from "../../../utils/loading_spinner/LoadingSpinner";
import snackbarTranslated from "../../../utils/snackbar/snackbarTranslated";
import { useAppTranslation } from "../../../utils/translation/translationWrapper";
import { CustomDatePicker } from "../addProductStepper/DatePicker";
import { FormValidationList } from "../formValidation/FormValidationList";
import { useProductDate } from "../hook/useProductDate";
interface EditProductProps {
  product: Product;
  setUpdatedProduct: {
    (index: number, changedProduct: Product): void;
  };
  index: number;
  setEditMode: (value: boolean) => void;
}
export const EditModeProduct = ({
  product,
  setUpdatedProduct,
  index,
  setEditMode,
}: EditProductProps) => {
  const t = useAppTranslation(foodExchangeDictionary);
  const translation = "Tabs.ProductCard.DetailsCardProduct.";
  const translationProductCard = "Tabs.ProductCard.";
  const translationRequests = "Tabs.ProductCard.DetailsCardProduct.Requests.";
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [editProduct, setEditProduct] = useState<Partial<CreateProductType>>();
  const handleUpdateEditProduct = (update: Partial<CreateProductType>) => {
    setEditProduct((prevState) => ({ ...prevState, ...update }));
  };
  const { register, handleSubmit, reset, control, formState, watch, setValue } =
    useForm<CreateProductType>({
      defaultValues: product as CreateProductType,
    });
  const [modalIsOpen, setModalIsOpen] = useState(false);

  const handleClearAndExitEditMode = () => {
    reset();
    handleResetDate();
    setEditMode(false);
  };

  const onSubmit = async (data: CreateProductType) => {
    handleEditProduct({
      ...data,
      ...editProduct,
    });
    setEditMode(false);
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
                t(translationRequests + "ActulizationProduct.success"),
                "success"
              );
              setUpdatedProduct(index, resAxios.product);
              return;
            }
            if (resAxios.key !== undefined) {
              snackbarTranslated(
                t(
                  translationRequests +
                    "ActulizationProduct.Error." +
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
              t(translationRequests + "ActulizationProduct.Error.general"),
              "error"
            );
          });
      })
      .catch((error) => {
        snackbarTranslated(
          t(translationRequests + "ActulizationProduct.Error.general"),
          "error"
        );
      });
  };

  const handleEditProduct = async (editProduct: CreateProductType) => {
    if (editProduct) {
      const requestOptions = {
        body: JSON.stringify({
          ...editProduct,
        }),
        headers: {
          "If-Match": product.etag,
        },
      };

      await fetchWithAuthorization(
        `${foodExchangeUrl}product/products`,
        HTTP_PUT,
        requestOptions
      )
        .then((res) => {
          res
            .json()
            .then((resAxios) => {
              if (res.ok) {
                snackbarTranslated(
                  t(translationRequests + "EditProduct.success"),
                  "success"
                );
                setUpdatedProduct(index, resAxios.product);
                return;
              }
              if (resAxios.key !== undefined) {
                if (resAxios.key === "exception.outdated_data") {
                  fetchProduct();
                }
                snackbarTranslated(
                  t(translationRequests + "EditProduct.Error." + resAxios.key),
                  "error"
                );
                return;
              }
              throw new Error();
            })
            .catch((error) => {
              snackbarTranslated(
                t(translationRequests + "EditProduct.Error.general"),
                "error"
              );
              handleClearAndExitEditMode();
            });
        })
        .catch((error) => {
          snackbarTranslated(
            t(translationRequests + "EditProduct.Error.general"),
            "error"
          );
          handleClearAndExitEditMode();
        });
    }
  };

  const { dates, handleResetDate, handleUpdate, todayDate } = useProductDate({
    product,
    handleProductUpdate: handleUpdateEditProduct,
  });
  const nowDate = dayjs();
  const validationRules = FormValidationList(t);

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle>
          <Grid container>
            <Grid item xs={10}>
              <TextField
                InputProps={{
                  sx: {
                    fontSize: "3rem",
                  },
                }}
                variant="standard"
                {...register("name", { ...validationRules.title })}
                error={!!formState.errors.name}
                helperText={formState.errors.name?.message}
              />
            </Grid>

            <Grid container item xs={2} justifyContent="flex-end">
              <>
                <IconButton type="submit">
                  <SaveIcon fontSize="large" />
                </IconButton>
                <IconButton onClick={handleClearAndExitEditMode}>
                  <ClearIcon fontSize="large" />
                </IconButton>
              </>
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
          <Grid container spacing={1}>
            <Grid item xs={6}>
              <Typography variant={"buttom" as TypographyVariant}>
                {t(translation + "describe") + ": "}
              </Typography>
              <Typography>
                <TextField
                  type="text"
                  variant="standard"
                  multiline
                  fullWidth
                  rows={4}
                  {...register("description", {
                    ...validationRules.description,
                  })}
                  error={!!formState.errors.description}
                  helperText={formState.errors.description?.message}
                ></TextField>
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant={"buttom" as TypographyVariant}>
                {t(translation + "category") + ": "}
              </Typography>
              <Typography>
                <Controller
                  name="categories"
                  control={control}
                  render={({ field }) => (
                    <FormControl variant="standard" sx={{ minWidth: 120 }}>
                      <Select {...field}>
                        {productCategoriesKeys.map((category) => (
                          <MenuItem key={category} value={category}>
                            {t(
                              translationProductCard +
                                "Categories." +
                                category.toLowerCase()
                            )}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                />
              </Typography>
            </Grid>
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
            <Grid item xs={6}>
              <Typography variant={"buttom" as TypographyVariant}>
                {t(translation + "receiptDateFrom") + ": "}
              </Typography>
              <LocalizationProvider
                dateAdapter={AdapterDayjs}
                adapterLocale={i18n?.language}
              >
                <Typography>
                  <CustomDatePicker
                    value={dates.startExchangeTime}
                    onChange={(newDate) =>
                      handleUpdate("startExchangeTime", newDate)
                    }
                    isMobile={isMobile}
                    maxDate={dates.expirationDate}
                  />
                </Typography>
              </LocalizationProvider>
            </Grid>
            <Grid item xs={6}>
              <Typography variant={"buttom" as TypographyVariant}>
                {t(translation + "receiptDateTo") + ": "}
              </Typography>
              <Typography>
                <LocalizationProvider
                  dateAdapter={AdapterDayjs}
                  adapterLocale={i18n?.language}
                >
                  <CustomDatePicker
                    value={dates.endExchangeTime}
                    onChange={(newDate) =>
                      handleUpdate("endExchangeTime", newDate)
                    }
                    isMobile={isMobile}
                    minDate={dates.startExchangeTime}
                    maxDate={dates.expirationDate}
                  />
                </LocalizationProvider>
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant={"buttom" as TypographyVariant}>
                {t(translation + "receiptHourFrom") + ": "}
              </Typography>
              <Typography>
                <LocalizationProvider
                  dateAdapter={AdapterDayjs}
                  adapterLocale={i18n?.language}
                >
                  <MobileTimePicker
                    value={dates.startExchangeTime}
                    onChange={(newDate) =>
                      handleUpdate("startExchangeTime", newDate)
                    }
                    maxTime={dates.endExchangeTime}
                  />
                </LocalizationProvider>
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant={"buttom" as TypographyVariant}>
                {t(translation + "receiptHourTo") + ": "}
              </Typography>
              <Typography>
                <LocalizationProvider
                  dateAdapter={AdapterDayjs}
                  adapterLocale={i18n?.language}
                >
                  <MobileTimePicker
                    value={dates.endExchangeTime}
                    onChange={(newDate) =>
                      handleUpdate("endExchangeTime", newDate)
                    }
                    minTime={dates.startExchangeTime}
                  />
                </LocalizationProvider>
              </Typography>
            </Grid>

            <LocalizationProvider
              dateAdapter={AdapterDayjs}
              adapterLocale={i18n?.language}
            >
              <Grid item xs={6}>
                <Typography variant={"buttom" as TypographyVariant}>
                  {t(translation + "expirationDate") + ": "}
                </Typography>
                <Typography>
                  <CustomDatePicker
                    value={dates.expirationDate}
                    onChange={(newDate) =>
                      handleUpdate("expirationDate", newDate)
                    }
                    format="DD/MM/YYYY"
                    disablePast={true}
                  />
                </Typography>
              </Grid>
            </LocalizationProvider>
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
            <Grid container item xs={12}>
              <LocalizationProvider
                dateAdapter={AdapterDayjs}
                adapterLocale={i18n?.language}
              >
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
                  <Typography variant={"buttom" as TypographyVariant}>
                    {t(
                      translationProductCard + "ProductionType.productionType"
                    ) + ": "}
                  </Typography>
                  <Controller
                    name="homemade"
                    control={control}
                    render={({ field }) => (
                      <RadioGroup
                        {...field}
                        onChange={(e) =>
                          setValue(
                            "homemade",
                            e.target.value === "true" ? true : false
                          )
                        }
                      >
                        <FormControlLabel
                          value={true}
                          label={t(
                            translationProductCard +
                              "ProductionType." +
                              ProductionType.HOMEMADE
                          )}
                          control={<Radio />}
                        />
                        <FormControlLabel
                          value={false}
                          label={t(
                            translationProductCard +
                              "ProductionType." +
                              ProductionType.PURCHASED
                          )}
                          control={<Radio />}
                        />
                      </RadioGroup>
                    )}
                  />
                  {watch("homemade").valueOf() && (
                    <Grid item xs={6}>
                      <Typography variant={"buttom" as TypographyVariant}>
                        {t(translation + "foodProductionDate") + ": "}
                      </Typography>
                      <Typography>
                        <CustomDatePicker
                          value={dates.productionDate}
                          maxDate={todayDate}
                          disablePast={false}
                          isMobile={isMobile}
                          onChange={(newDate) => {
                            handleUpdate("productionDate", newDate);
                          }}
                        />
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </LocalizationProvider>
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
          </Grid>
          <LoadingState open={formState.isSubmitting} />
        </DialogContent>
      </form>
    </>
  );
};
