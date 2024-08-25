import EventIcon from "@mui/icons-material/Event";
import LunchDiningIcon from "@mui/icons-material/LunchDining";
import PlaceIcon from "@mui/icons-material/Place";
import { ReservationType, ownReceipt } from "../../../type/mzwz";
const translation = "Tabs.AllProducts.ReservationStepper.";

export const reservationProductSteps = (
  t: Function,
  activeStep: number,
  choice: ReservationType | undefined
) => [
  {
    label: `${t(translation + "TypeOfReservationStep.title")}`,
    icon: (
      <EventIcon
        fontSize="large"
        color={activeStep >= 0 ? "secondary" : "primary"}
      />
    ),
  },
  {
    label:
      choice === ownReceipt
        ? `${t(translation + "ReceiptDetails.title")}`
        : `${t(translation + "DeliveryDetails.title")}`,
    icon: (
      <PlaceIcon
        fontSize="large"
        color={activeStep >= 1 ? "secondary" : "primary"}
      />
    ),
  },
  {
    label: `${t(translation + "DetailsProductStep.title")}`,
    icon: (
      <LunchDiningIcon
        fontSize="large"
        color={activeStep >= 2 ? "secondary" : "primary"}
      />
    ),
  },
];
