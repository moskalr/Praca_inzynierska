import AddIcon from "@mui/icons-material/Add";
import FmdGoodRoundedIcon from "@mui/icons-material/FmdGoodRounded";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";

export const eventSteps = (t: Function, activeStep: number) => {
  return [
    {
      label: `${t("events.stepper.createEvent")}`,
      icon: (
        <GroupsRoundedIcon
          fontSize="large"
          color={activeStep >= 0 ? "secondary" : "primary"}
        />
      ),
    },
    {
      label: `${t("events.stepper.createAddress")}`,
      icon: (
        <FmdGoodRoundedIcon
          fontSize="large"
          color={activeStep >= 1 ? "secondary" : "primary"}
        />
      ),
    },
    {
      label: `${t("events.stepper.createProduct")}`,
      icon: (
        <AddIcon
          fontSize="large"
          color={activeStep >= 2 ? "secondary" : "primary"}
        />
      ),
    },
  ];
};
