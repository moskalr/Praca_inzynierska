import {
  Box,
  Button,
  Chip,
  FormControlLabel,
  FormHelperText,
  Grid,
  Radio,
  RadioGroup,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { plPL } from "@mui/x-date-pickers/locales";
import dayjs from "dayjs";
import "dayjs/locale/pl";
import { i18n } from "next-i18next";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { foodExchangeDictionary } from "../../../constants/dictionary";
import {
  CreateProductType,
  DateNames,
  Product,
  ProductCategory,
  ProductionType,
  productCategoriesKeys,
} from "../../../type/mzwz";
import { StepperNavigationNext } from "../../../type/stepperNavigation";
import { formatLocalDateTime } from "../../../utils/date/date";
import { useAppTranslation } from "../../../utils/translation/translationWrapper";
import { FormValidationList } from "../formValidation/FormValidationList";
import { useProductDate } from "../hook/useProductDate";
import { CustomDatePicker } from "./DatePicker";

const textFieldVariant = "outlined";
const translation = "Tabs.AllProducts.AddProductStepper.DetailsProductStep.";
const polishLocale =
  plPL.components.MuiLocalizationProvider.defaultProps.localeText;

interface CreateProductProps {
  createdProduct: CreateProductType;
  handleUpdateDate: (dateToChange: DateNames, newValue: Date | null) => void;
  selectedExpirationDate: Date | null;
  handleUpdateProduct: (update: Partial<CreateProductType>) => void;
}

type CreateProductPropsWithSteppe = CreateProductProps & StepperNavigationNext;

interface ProductDetailsFormData {
  name: string;
  description: string;
  categories: ProductCategory;
  homemade: boolean;
}

function CreateProductMZWZ({
  createdProduct,
  handleNext,
  selectedExpirationDate,
  handleUpdateDate,
  handleUpdateProduct,
}: CreateProductPropsWithSteppe) {
  const t = useAppTranslation(foodExchangeDictionary);
  const { register, handleSubmit, formState, control, setValue, watch } =
    useForm<ProductDetailsFormData>({
      defaultValues: {
        name: createdProduct.name,
        description: createdProduct.description,
        categories: createdProduct.categories,
        homemade: createdProduct.homemade ? createdProduct.homemade : false,
      },
    });
  const { dates, handleResetDate, handleUpdate, todayDate } = useProductDate({
    product: createdProduct as Product,
    handleProductUpdate: handleUpdateProduct,
  });
  const [foodCategory, setFoodCategory] = useState<ProductCategory>();
  const validationRules = FormValidationList(t);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const handleFoodCategoryChange = (value: ProductCategory) => {
    if (value) {
      setFoodCategory(value);
      handleUpdateProduct({ categories: value });
    }
  };
  const nowDate = dayjs();

  const onSubmit = async ({
    name,
    description,
    categories,
    homemade,
  }: ProductDetailsFormData) => {
    const expirationDate =
      selectedExpirationDate !== null
        ? formatLocalDateTime(selectedExpirationDate?.toLocaleString())
        : createdProduct.expirationDate;
    const productionDate = homemade
      ? formatLocalDateTime(dates.productionDate?.toLocaleString())
      : createdProduct.productionDate;

    handleUpdateProduct({
      name,
      description,
      expirationDate,
      categories,
      homemade,
    });
    handleNext();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Grid
        container
        direction="column"
        justifyContent="flex-start"
        alignItems="left"
      >
        <Typography sx={{ m: 0.5, mt: 1 }}>
          <TextField
            type="text"
            fullWidth
            variant={textFieldVariant}
            defaultValue={createdProduct.name}
            {...register("name", { ...validationRules.title })}
            label={t(translation + "productTitle") + " *"}
            size="small"
            error={!!formState.errors.name}
            helperText={formState.errors.name?.message}
          />
        </Typography>

        <Typography sx={{ m: 0.5 }}>
          <TextField
            multiline
            rows={4}
            type="text"
            fullWidth
            variant={textFieldVariant}
            defaultValue={createdProduct.description}
            {...register("description", { ...validationRules.description })}
            label={t(translation + "productDescription") + " *"}
            size="small"
            error={!!formState.errors.description}
            helperText={formState.errors.description?.message}
          />
        </Typography>
        <Typography sx={{ m: 0.5 }}>
          <Typography sx={{ m: 0.5 }} variant="subtitle1">
            {t(translation + "productCategory")}
          </Typography>
          <Controller
            name="categories"
            rules={validationRules.category}
            control={control}
            render={({ field, fieldState }) => (
              <>
                {productCategoriesKeys.map((category) => (
                  <Chip
                    key={category}
                    sx={{
                      mr: 0.5,
                      mb: 0.5,
                      mt: 0.5,
                    }}
                    label={t(
                      translation + "Categories." + category.toLowerCase()
                    )}
                    variant={
                      watch("categories") === category ? "filled" : "outlined"
                    }
                    color={formState.errors.categories ? "error" : "default"}
                    onClick={(e) => {
                      setValue("categories", category);
                      field.onChange(category);
                    }}
                  />
                ))}
                <FormHelperText
                  sx={{ ml: 2 }}
                  error={!!formState.errors.categories}
                >
                  {formState.errors.categories?.message}
                </FormHelperText>
              </>
            )}
          />
        </Typography>
        <Typography sx={{ m: 0.5 }}>
          <Typography sx={{ m: 0.5 }} variant="subtitle1">
            {t(translation + "productExpirationDate")}
          </Typography>
          <LocalizationProvider
            dateAdapter={AdapterDayjs}
            adapterLocale={i18n?.language}
            localeText={polishLocale}
          >
            <CustomDatePicker
              value={selectedExpirationDate}
              onChange={(newValue) =>
                handleUpdateDate("expirationDate", newValue)
              }
            />
          </LocalizationProvider>
        </Typography>
        <Grid container sx={{ m: 0.5 }}>
          <Grid item xs={6}>
            <Typography sx={{ m: 0.5 }} variant="subtitle1">
              {t(translation + "ProductionType.productionType") + ": "}
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
                      translation + "ProductionType." + ProductionType.HOMEMADE
                    )}
                    control={<Radio />}
                  />
                  <FormControlLabel
                    value={false}
                    label={t(
                      translation + "ProductionType." + ProductionType.PURCHASED
                    )}
                    control={<Radio />}
                  />
                </RadioGroup>
              )}
            />
          </Grid>
          {watch("homemade").valueOf() && (
            <Grid item xs={6}>
              <>
                <Typography variant="subtitle1" sx={{ m: 0.5, mb: 1 }}>
                  {t(translation + "foodProductionDate") + ": "}
                </Typography>
                <Typography>
                  <LocalizationProvider
                    dateAdapter={AdapterDayjs}
                    adapterLocale={i18n?.language}
                    localeText={polishLocale}
                  >
                    <CustomDatePicker
                      value={dates.productionDate}
                      maxDate={todayDate}
                      disablePast={false}
                      isMobile={isMobile}
                      onChange={(newDate) => {
                        handleUpdate("productionDate", newDate);
                      }}
                    />
                  </LocalizationProvider>
                </Typography>
              </>
            </Grid>
          )}
        </Grid>

        <Box m={0.5} textAlign="right">
          <Button type="submit" variant="contained" color="primary">
            {t(translation + "next")}
          </Button>
        </Box>
      </Grid>
    </form>
  );
}

export default CreateProductMZWZ;
