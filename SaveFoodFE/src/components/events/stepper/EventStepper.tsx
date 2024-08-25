import CloseIcon from "@mui/icons-material/Close";
import {
  Dialog,
  DialogTitle,
  Grid,
  IconButton,
  Slide,
  Step,
  StepIcon,
  StepLabel,
  Stepper,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { TransitionProps } from "@mui/material/transitions";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { eaaDictionary } from "../../../constants/dictionary";
import { HTTP_POST } from "../../../constants/httpMethods";
import {
  initialAddress,
  initialEvent,
  initialProduct,
} from "../../../constants/initialEAAData";
import {
  CreateAddressMZWO,
  CreateEventMZWO,
  CreateProductMZWO,
} from "../../../type/mzwo";
import fetchWithAuthorization from "../../../utils/axios/fetchWrapper";
import LoadingState from "../../../utils/loading_spinner/LoadingSpinner";
import snackbar from "../../../utils/snackbar/snackbar";
import CreateAddress from "./CreateAddress";
import CreateEvent from "./CreateEvent";
import CreateProduct from "./CreateProduct";
import { eventSteps } from "./EventSteps";

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

interface EventStepperProps {
  open: boolean;
  onClose: () => void;
  handleFormOpen: () => void;
  updateEvents: () => void;
}

function EventStepper({
  open,
  onClose,
  handleFormOpen,
  updateEvents,
}: EventStepperProps) {
  const [activeStep, setActiveStep] = useState(0);
  const [previousStep, setPreviousStep] = useState(-1);
  const [createdEvent, setCreatedEvent] =
    useState<CreateEventMZWO>(initialEvent);
  const [createdAddress, setCreatedAddress] =
    useState<CreateAddressMZWO>(initialAddress);
  const [createdProduct, setCreatedProduct] =
    useState<CreateProductMZWO>(initialProduct);
  const { t } = useTranslation(eaaDictionary);
  const [isLoading, setIsLoading] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const steps = eventSteps(t, activeStep);
  const movedForward = previousStep < activeStep;

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
    setPreviousStep(activeStep - 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
    setPreviousStep(activeStep + 1);
  };

  const handleSaveEvent = async (createdEvent: CreateEventMZWO) => {
    if (createdEvent) {
      try {
        const requestOptions = {
          body: JSON.stringify(createdEvent),
        };

        const response = await fetchWithAuthorization(
          `/api/events-announcements/events/createEvent`,
          HTTP_POST,
          requestOptions
        );
        const data = await response.json();
        if (response.ok) {
          updateEvents();
          snackbar("snackbar.successMessage.eventCreate", "success", t);
          setIsLoading(false);
          handleFormOpen();
        } else if (data.key !== undefined) {
          snackbar(data.key, "error", t);
        } else {
          snackbar("snackbar.errorMessage.eventCreate", "error", t);
        }
        setIsLoading(false);
      } catch (error) {
        snackbar("snackbar.errorMessage.default", "error", t);
        setIsLoading(false);
      }
    }
  };

  const onSubmit = async () => {
    setIsLoading(true);
    await handleSaveEvent(createdEvent);
  };

  const handleCreateEvent = (updatedProduct: CreateProductMZWO) => {
    setCreatedEvent((prevCreatedEvent) => ({
      ...prevCreatedEvent,
      location: createdAddress,
      product: updatedProduct,
    }));
  };

  const handleCreateEventDetails = (createdEventDetails: CreateEventMZWO) => {
    setCreatedEvent({ ...createdEvent, ...createdEventDetails });
  };
  const handleCreateAddress = (createdEventAddress: CreateAddressMZWO) => {
    setCreatedAddress({ ...createdAddress, ...createdEventAddress });
  };
  const handleCreateProduct = (createdEventProduct: CreateProductMZWO) => {
    setCreatedProduct((prevCreatedProduct) => {
      const updatedProduct = {
        ...prevCreatedProduct,
        ...createdEventProduct,
      };
      handleCreateEvent(updatedProduct);
      return updatedProduct;
    });
  };

  return (
    <Dialog
      open={open}
      TransitionComponent={Transition}
      keepMounted
      scroll="paper"
      sx={{
        "& .MuiDialog-container": {
          "& .MuiPaper-root": {
            width: "100%",
            maxWidth: !isMobile ? "86%" : "100%",
          },
        },
      }}
    >
      <DialogTitle>
        <Grid container xs={12}>
          <Grid item xs={10}>
            <Typography variant="h6" color="secondary.main">
              {t("events.stepper.eventOrganization")}
            </Typography>
          </Grid>
          <Grid item xs={2} justifyContent="flex-end">
            <Tooltip title={t("events.stepper.cancel")} placement="top">
              <IconButton onClick={onClose}>
                <CloseIcon />
              </IconButton>
            </Tooltip>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="caption" color="red">
              {t("events.stepper.required")}
            </Typography>
          </Grid>
        </Grid>
      </DialogTitle>
      <Stepper activeStep={activeStep} alternativeLabel>
        {steps.map((step, index) => (
          <Step key={index}>
            <StepLabel icon={<StepIcon icon={step.icon} />} color="red">
              {step.label}
            </StepLabel>
          </Step>
        ))}
      </Stepper>
      {activeStep === 0 && (
        <Slide
          direction={movedForward ? "right" : "right"}
          in={activeStep === 0}
          mountOnEnter
          unmountOnExit
        >
          <div>
            <CreateEvent
              createdEvent={createdEvent}
              handleNext={handleNext}
              handleFormOpen={handleFormOpen}
              handleCreateEventDetails={handleCreateEventDetails}
            />
          </div>
        </Slide>
      )}
      {activeStep === 1 && (
        <Slide
          direction={movedForward ? "left" : "right"}
          in={activeStep === 1}
          mountOnEnter
          unmountOnExit
        >
          <div>
            <CreateAddress
              createdAddress={createdAddress}
              handleNext={handleNext}
              handleBack={handleBack}
              handleCreateAddress={handleCreateAddress}
            />
          </div>
        </Slide>
      )}
      {activeStep === 2 && (
        <Slide
          direction={movedForward ? "left" : "right"}
          in={activeStep === 2}
          mountOnEnter
          unmountOnExit
        >
          <div>
            <CreateProduct
              createdProduct={createdProduct}
              handleBack={handleBack}
              handleComplete={onSubmit}
              handleCreateProduct={handleCreateProduct}
            />
          </div>
        </Slide>
      )}
      <LoadingState open={isLoading} />
    </Dialog>
  );
}

export default EventStepper;
