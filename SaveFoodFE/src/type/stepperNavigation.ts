export type StepperNavigation = {
  handleNext: () => void;
  handleBack: () => void;
  handleFinish: () => void;
};

export type StepperNavigationNext = Pick<StepperNavigation, "handleNext">;

export type StepperNavigationBack = Pick<StepperNavigation, "handleBack">;

export type StepperNavigationFinish = Pick<StepperNavigation, "handleFinish">;
