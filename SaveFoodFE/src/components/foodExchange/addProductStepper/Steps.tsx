import AccessTimeIcon from "@mui/icons-material/AccessTime";
import FmdGoodRoundedIcon from "@mui/icons-material/FmdGoodRounded";
import LunchDiningIcon from "@mui/icons-material/LunchDining";

const translation = "Tabs.OwnProducts.AddProductStepper.";

export const addProductSteps = (t: Function, activeStep: number) => [
  {
    label: `${t(translation + "DetailsProductStep.title")}`,
    icon: (
      <LunchDiningIcon
        fontSize="large"
        color={activeStep >= 0 ? "secondary" : "primary"}
      />
    ),
  },
  {
    label: `${t(translation + "PickupTimeStep.title")}`,
    icon: (
      <AccessTimeIcon
        fontSize="large"
        color={activeStep >= 1 ? "secondary" : "primary"}
      />
    ),
  },
  {
    label: `${t(translation + "PickupLocationStep.title")}`,
    icon: (
      <FmdGoodRoundedIcon
        fontSize="large"
        color={activeStep >= 2 ? "secondary" : "primary"}
      />
    ),
  },
];
