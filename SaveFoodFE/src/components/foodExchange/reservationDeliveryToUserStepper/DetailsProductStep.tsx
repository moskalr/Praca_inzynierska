import {
  Box,
  Button,
  Grid,
  Rating,
  Typography,
  TypographyVariant,
} from "@mui/material";
import { useTranslation } from "react-i18next";

import dayjs from "dayjs";
import { GridTextItem } from "../../../UIcomponents";
import { foodExchangeDictionary } from "../../../constants/dictionary";
import { Product, ProductionType } from "../../../type/mzwz";
import { StepperNavigationNext } from "../../../type/stepperNavigation";

const textFieldVariant = "outlined";

type CreateProductProps = {
  deliveryToUserProduct: Product;
};

type CreateProductPropsWithStepper = CreateProductProps & StepperNavigationNext;

function DetailsProduct({
  deliveryToUserProduct,
  handleNext,
}: CreateProductPropsWithStepper) {
  const translation =
    "Tabs.AllDeliveries.DeliveryCard.ReservationDelivery.DetailsCardProduct.";

  const { t } = useTranslation(foodExchangeDictionary);
  const expirationDate = dayjs(deliveryToUserProduct.expirationDate);

  return (
    <>
      <Grid container>
        <GridTextItem
          text={deliveryToUserProduct.description}
          header={t(translation + "describe") + ": "}
        />
        <GridTextItem
          header={t(translation + "category") + ": "}
          text={t(
            translation +
              "Categories." +
              deliveryToUserProduct.categories?.toLowerCase()
          )}
        />
        <GridTextItem
          header={t(translation + "foodDonor") + ": "}
          text={deliveryToUserProduct.accountUserName}
        />
        <Grid container direction="column" item xs={6} sx={{ marginTop: 1 }}>
          <Typography variant={"buttom" as TypographyVariant}>
            {t(translation + "foodDonorRating") + ": "}
          </Typography>
          <Rating
            name="read-only"
            size="large"
            value={deliveryToUserProduct.accountAvgRating}
            readOnly
          />
        </Grid>

        <GridTextItem
          header={t(translation + "expirationDate") + ": "}
          text={deliveryToUserProduct.expirationDate}
        />
        {deliveryToUserProduct.homemade && (
          <GridTextItem
            header={t(translation + "productionDate") + ": "}
            text={deliveryToUserProduct.productionDate}
          />
        )}
        <GridTextItem
          header={t(translation + "ProductionType.productionType") + ": "}
          text={
            deliveryToUserProduct.homemade
              ? t(translation + "ProductionType." + ProductionType.HOMEMADE)
              : t(translation + "ProductionType." + ProductionType.PURCHASED)
          }
        />
      </Grid>
      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
        <Button
          onClick={(e) => handleNext()}
          sx={{ margin: 1 }}
          variant="contained"
        >
          {t(translation + "next")}
        </Button>
      </Box>
    </>
  );
}

export default DetailsProduct;
