import {
  Button,
  Divider,
  Grid,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import Box from "@mui/material/Box";
import { MobileTimePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { plPL } from "@mui/x-date-pickers/locales";
import "dayjs/locale/en";
import "dayjs/locale/pl";
import { i18n } from "next-i18next";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { foodExchangeDictionary } from "../../../constants/dictionary";
import {
  CreateProductType,
  DateNames,
  ExchangeDatesType,
} from "../../../type/mzwz";
import {
  StepperNavigationBack,
  StepperNavigationNext,
} from "../../../type/stepperNavigation";
import { formatLocalDateTime } from "../../../utils/date/date";
import { CustomDatePicker } from "./DatePicker";

const translation = "Tabs.OwnProducts.AddProductStepper.PickupTimeStep.";
const polishLocale =
  plPL.components.MuiLocalizationProvider.defaultProps.localeText;

interface ProductAvailabilityProps {
  createdProduct: CreateProductType;
  dates: ExchangeDatesType;
  handleUpdate: (dateToChange: DateNames, newValue: Date | null) => void;
  handleUpdateProduct: (update: Partial<CreateProductType>) => void;
}

type ProductAvailabilityPropsWithSteppe = ProductAvailabilityProps &
  StepperNavigationNext &
  StepperNavigationBack;

function AddProductAvailability({
  createdProduct,
  handleNext,
  handleBack,
  dates,
  handleUpdate,
  handleUpdateProduct,
}: ProductAvailabilityPropsWithSteppe) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { t } = useTranslation(foodExchangeDictionary);
  const { handleSubmit } = useForm();

  const onSubmit = async () => {
    const startExchangeTime =
      dates.startExchangeTime !== null
        ? formatLocalDateTime(dates.startExchangeTime?.toLocaleString())
        : createdProduct.startExchangeTime;

    const endExchangeTime =
      dates.endExchangeTime !== null && dates.endExchangeTime !== undefined
        ? formatLocalDateTime(dates.endExchangeTime?.toLocaleString())
        : createdProduct.endExchangeTime;

    handleUpdateProduct({ startExchangeTime, endExchangeTime });
    handleNext();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Grid container columns={12} spacing={1} sx={{ mt: 1 }} direction="row">
        <Grid
          item
          xs={5}
          alignItems="center"
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          {t(translation + "fromDay")}
          <LocalizationProvider
            dateAdapter={AdapterDayjs}
            adapterLocale={i18n?.language}
            localeText={polishLocale}
          >
            <Typography>
              <CustomDatePicker
                value={dates.startExchangeTime}
                onChange={(newValue) =>
                  handleUpdate("startExchangeTime", newValue)
                }
                isMobile={isMobile}
                maxDate={dates.expirationDate}
              />
            </Typography>
          </LocalizationProvider>
          {t(translation + "toDay")}
          <Typography>
            <LocalizationProvider
              dateAdapter={AdapterDayjs}
              adapterLocale={i18n?.language}
              localeText={polishLocale}
            >
              <CustomDatePicker
                value={dates.endExchangeTime}
                onChange={(newValue) =>
                  handleUpdate("endExchangeTime", newValue)
                }
                isMobile={isMobile}
                minDate={dates.startExchangeTime}
                maxDate={dates.expirationDate}
              />
            </LocalizationProvider>
          </Typography>
        </Grid>
        <Grid
          item
          xs={2}
          alignItems="center"
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <Divider
            variant="fullWidth"
            orientation={isMobile ? "horizontal" : "vertical"}
          />
        </Grid>
        <Grid
          item
          xs={5}
          alignItems="center"
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          {t(translation + "fromHours")}
          <Typography>
            <LocalizationProvider
              dateAdapter={AdapterDayjs}
              adapterLocale={i18n?.language}
              localeText={polishLocale}
            >
              <MobileTimePicker
                value={dates.startExchangeTime}
                onChange={(newValue) =>
                  handleUpdate("startExchangeTime", newValue)
                }
                maxTime={dates.endExchangeTime}
              />
            </LocalizationProvider>
          </Typography>
          {t(translation + "toHours")}
          <Typography>
            <LocalizationProvider
              dateAdapter={AdapterDayjs}
              adapterLocale={i18n?.language}
              localeText={polishLocale}
            >
              <MobileTimePicker
                value={dates.endExchangeTime}
                onChange={(newValue) =>
                  handleUpdate("endExchangeTime", newValue)
                }
                minTime={dates.startExchangeTime}
              />
            </LocalizationProvider>
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Box m={0.5} textAlign="right">
            <Button
              sx={{ mr: 1 }}
              onClick={handleBack}
              variant="contained"
              color="primary"
            >
              {t(translation + "back")}
            </Button>
            <Button type="submit" variant="contained" color="primary">
              {t(translation + "next")}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </form>
  );
}

export default AddProductAvailability;
