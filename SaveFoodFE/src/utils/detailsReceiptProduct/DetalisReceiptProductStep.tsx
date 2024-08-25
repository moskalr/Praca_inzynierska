import {
  Button,
  Divider,
  Grid,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import Box from "@mui/material/Box";
import { useTranslation } from "react-i18next";

import dayjs from "dayjs";
import dynamic from "next/dynamic";
import { foodExchangeDictionary } from "../../constants/dictionary";
import { Product } from "../../type/mzwz";
import { DateRangePicker } from "../../components/foodExchange/reservationDeliveryToUserStepper/DateRangePicker";
import { ReservationDeliveryTextField } from "../../components/foodExchange/reservationDeliveryToUserStepper/ReservationDeliveryTexyField";
import { TimeRangePicker } from "../../components/foodExchange/reservationDeliveryToUserStepper/TimeRangePicker";
import {
  StepperNavigationBack,
  StepperNavigationNext,
} from "../../type/stepperNavigation";

const textFieldVariant = "outlined";
const translation = "Tabs.AllProducts.ReservationStepper.ReceiptDetails.";
const translationNavigation =
  "Tabs.AllProducts.ReservationStepper.ActionStepsButton.";
type ProductAvailabilityProps = {
  deliveryToUserProduct: Product;
};

type ProductAvailabilityPropsWithStepper = ProductAvailabilityProps &
  StepperNavigationNext &
  StepperNavigationBack;

function DetailsReceiptProductStep({
  deliveryToUserProduct,
  handleNext,
  handleBack,
}: ProductAvailabilityPropsWithStepper) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { t } = useTranslation(foodExchangeDictionary);
  const DynamicMap = dynamic(() => import("../../components/map/MapMZWZ"), {
    ssr: false,
  });
  const startExchangeDateTime = dayjs(deliveryToUserProduct.startExchangeTime);
  const endExchangeDateTime = dayjs(deliveryToUserProduct.endExchangeTime);

  return (
    <Grid container columns={12} spacing={1} sx={{ mt: 1 }} direction="row">
      <Grid item xs={8}>
        <Box>
          <DynamicMap
            specificLatitude={deliveryToUserProduct.mapAddress.latitude}
            specificLongitude={deliveryToUserProduct.mapAddress.longitude}
            visibleButton={false}
          />
        </Box>
      </Grid>
      <Grid container item xs={4}>
        <Grid item xs={12}>
          <Typography sx={{ ml: 1 }} variant="h6">
            {t(translation + "Address.title")}
          </Typography>
          <ReservationDeliveryTextField
            label={t(translation + "Address.street")}
            defaultValue={deliveryToUserProduct.mapAddress.street}
          />
          <ReservationDeliveryTextField
            label={t(translation + "Address.number")}
            defaultValue={deliveryToUserProduct.mapAddress.streetNumber}
          />
          <ReservationDeliveryTextField
            label={t(translation + "Address.postalCode")}
            defaultValue={deliveryToUserProduct.mapAddress.postalCode}
          />
          <ReservationDeliveryTextField
            label={t(translation + "Address.city")}
            defaultValue={deliveryToUserProduct.mapAddress.city}
          />
        </Grid>
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
        <DateRangePicker
          startExchangeDate={startExchangeDateTime}
          endExchangeDate={endExchangeDateTime}
        />
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
        <TimeRangePicker
          startExchangeTime={startExchangeDateTime}
          endExchangeTime={endExchangeDateTime}
        />
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
          <Button onClick={handleNext} variant="contained" color="primary">
            {t(translationNavigation + "next")}
          </Button>
        </Box>
      </Grid>
    </Grid>
  );
}

export default DetailsReceiptProductStep;
