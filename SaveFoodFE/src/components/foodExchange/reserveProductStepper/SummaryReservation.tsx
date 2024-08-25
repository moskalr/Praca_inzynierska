import {
  Button,
  Grid,
  Rating,
  Typography,
  TypographyVariant,
} from "@mui/material";
import { useTranslation } from "react-i18next";

import dayjs from "dayjs";
import { GridTextItem } from "../../../UIcomponents";
import { Product, ProductionType } from "../../../type/mzwz";
import {
  StepperNavigationBack,
  StepperNavigationFinish,
} from "../../../type/stepperNavigation";

const textFieldVariant = "outlined";
const translation = "Tabs.AllProducts.ReservationStepper.DetailsProductStep.";
const translationNavigation =
  "Tabs.AllProducts.ReservationStepper.ActionStepsButton.";
const dictionary = "foodExchange";

type SummaryReservationProps = {
  product: Product;
};

type SummaryReservationPropsWithStepper = SummaryReservationProps &
  StepperNavigationFinish &
  StepperNavigationBack;

function SummaryReservation({
  product,
  handleFinish,
  handleBack,
}: SummaryReservationPropsWithStepper) {
  const { t } = useTranslation(dictionary);
  const expirationDate = dayjs(product.expirationDate);

  return (
    <Grid
      container
      direction="row"
      justifyContent="flex-start"
      alignItems="left"
    >
      <Grid container>
        <GridTextItem
          text={product.name}
          header={t(translation + "name") + ": "}
        />
        <GridTextItem
          text={product.description}
          header={t(translation + "describe") + ": "}
        />
        <GridTextItem
          header={t(translation + "category") + ": "}
          text={t(
            translation + "Categories." + product.categories?.toLowerCase()
          )}
        />
        <GridTextItem
          header={t(translation + "foodDonor") + ": "}
          text={product.accountUserName}
        />
        <Grid container direction="column" item xs={6} sx={{ marginTop: 1 }}>
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

        <GridTextItem
          header={t(translation + "expirationDate") + ": "}
          text={product.expirationDate}
        />
        {product.homemade && (
          <GridTextItem
            header={t(translation + "productionDate") + ": "}
            text={product.productionDate}
          />
        )}
        <GridTextItem
          header={t(translation + "ProductionType.productionType") + ": "}
          text={
            product.homemade
              ? t(translation + "ProductionType." + ProductionType.HOMEMADE)
              : t(translation + "ProductionType." + ProductionType.PURCHASED)
          }
        />
      </Grid>
      <Grid item m={0.5} xs={12} textAlign="right">
        <Button
          sx={{ mr: 1 }}
          onClick={handleBack}
          variant="contained"
          color="primary"
        >
          {t(translationNavigation + "back")}
        </Button>
        <Button onClick={handleFinish} variant="contained" color="primary">
          {t(translationNavigation + "finish")}
        </Button>
      </Grid>
    </Grid>
  );
}

export default SummaryReservation;
