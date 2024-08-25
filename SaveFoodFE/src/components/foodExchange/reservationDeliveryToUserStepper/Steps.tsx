import AccessTimeIcon from "@mui/icons-material/AccessTime";
import FmdGoodRoundedIcon from "@mui/icons-material/FmdGoodRounded";
import LunchDiningIcon from "@mui/icons-material/LunchDining";

const translation =
  "Tabs.AllDeliveries.DeliveryCard.ReservationDelivery.Steps.";

export const reservationDeliverySteps = (t: Function, activeStep: number) => [
  {
    label: `${t(translation + "detailsProductStep")}`,
    icon: (
      <LunchDiningIcon
        fontSize="large"
        color={activeStep >= 0 ? "secondary" : "primary"}
      />
    ),
  },
  {
    label: `${t(translation + "receiptDetailsStep")}`,
    icon: (
      <AccessTimeIcon
        fontSize="large"
        color={activeStep >= 1 ? "secondary" : "primary"}
      />
    ),
  },
  {
    label: `${t(translation + "deliveryDetailsStep")}`,
    icon: (
      <FmdGoodRoundedIcon
        fontSize="large"
        color={activeStep >= 2 ? "secondary" : "primary"}
      />
    ),
  },
];
