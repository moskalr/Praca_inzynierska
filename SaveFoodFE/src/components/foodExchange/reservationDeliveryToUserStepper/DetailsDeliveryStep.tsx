import { Button, Grid, Typography } from "@mui/material";
import Box from "@mui/material/Box";
import dynamic from "next/dynamic";
import { useTranslation } from "react-i18next";
import { foodExchangeDictionary } from "../../../constants/dictionary";
import { MapAddress } from "../../../type/mzwz";
import {
  StepperNavigationBack,
  StepperNavigationFinish,
} from "../../../type/stepperNavigation";
import { ReservationDeliveryTextField } from "./ReservationDeliveryTexyField";

const textFieldVariant = "outlined";
const translation = "Tabs.AllDeliveries.MakeReservationStepper.ReceiptDetails.";

type DeliveryProps = {
  deliveryToUserMap: MapAddress;
};

type DeliveryPropsWithStepper = DeliveryProps &
  StepperNavigationBack &
  StepperNavigationFinish;

function DetailsDeliveryStep({
  deliveryToUserMap,
  handleFinish,
  handleBack,
}: DeliveryPropsWithStepper) {
  const { t } = useTranslation(foodExchangeDictionary);
  const DynamicMap = dynamic(() => import("../../../components/map/MapMZWZ"), {
    ssr: false,
  });

  return (
    <Grid container columns={12} spacing={1} sx={{ mt: 1 }} direction="row">
      <Grid item xs={8}>
        <Box>
          <DynamicMap
            specificLatitude={deliveryToUserMap.latitude}
            specificLongitude={deliveryToUserMap.longitude}
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
            defaultValue={deliveryToUserMap.street}
          />
          <ReservationDeliveryTextField
            label={t(translation + "Address.number")}
            defaultValue={deliveryToUserMap.streetNumber}
          />
          <ReservationDeliveryTextField
            label={t(translation + "Address.postalCode")}
            defaultValue={deliveryToUserMap.postalCode}
          />
          <ReservationDeliveryTextField
            label={t(translation + "Address.city")}
            defaultValue={deliveryToUserMap.city}
          />
        </Grid>
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
          <Button onClick={handleFinish} variant="contained" color="primary">
            {t(translation + "reservation")}
          </Button>
        </Box>
      </Grid>
    </Grid>
  );
}

export default DetailsDeliveryStep;
