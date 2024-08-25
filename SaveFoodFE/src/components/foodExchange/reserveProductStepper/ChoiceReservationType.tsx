import { Box, Button } from "@mui/material";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormLabel from "@mui/material/FormLabel";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import React from "react";
import { useTranslation } from "react-i18next";
import { foodExchangeDictionary } from "../../../constants/dictionary";
import {
  ReservationType,
  ownReceipt,
  volunteerDelivery,
} from "../../../type/mzwz";
import { StepperNavigationNext } from "../../../type/stepperNavigation";

const textFieldVariant = "standard";
const translation =
  "Tabs.AllProducts.ReservationStepper.TypeOfReservationStep.";
const translationNavigation =
  "Tabs.AllProducts.ReservationStepper.ActionStepsButton.";

type ChoiseReservationPropsWithStepper = ChoiseReservationProps &
  StepperNavigationNext;

interface ChoiseReservationProps {
  setChoice: (value: ReservationType) => void;
  choice: ReservationType | undefined;
}

function ChoiseReservationType({
  setChoice,
  choice,
  handleNext,
}: ChoiseReservationPropsWithStepper) {
  const { t } = useTranslation(foodExchangeDictionary);
  const handleRadioChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setChoice(event.target.value as ReservationType);
  };

  return (
    <div>
      <FormControl>
        <FormLabel id="demo-radio-buttons-group-label">
          {t(translation + "typeOfReceipt")}
        </FormLabel>
        <RadioGroup
          name="radio-buttons-group"
          value={choice}
          onChange={handleRadioChange}
        >
          <FormControlLabel
            value={ownReceipt}
            control={<Radio />}
            label={t(translation + "personal")}
          />
          <FormControlLabel
            value={volunteerDelivery}
            control={<Radio />}
            label={t(translation + "volunteer")}
          />
        </RadioGroup>
      </FormControl>
      <Box m={0.5} textAlign="right">
        <Button
          disabled={!choice}
          onClick={handleNext}
          variant="contained"
          color="primary"
        >
          {t(translationNavigation + "next")}
        </Button>
      </Box>
    </div>
  );
}

export default ChoiseReservationType;
