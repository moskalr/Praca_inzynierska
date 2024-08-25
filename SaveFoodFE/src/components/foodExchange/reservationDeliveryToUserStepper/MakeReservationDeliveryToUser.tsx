import {
  Dialog,
  DialogContent,
  DialogTitle,
  Slide,
  StepIcon,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import Stepper from "@mui/material/Stepper";
import Typography from "@mui/material/Typography";
import { TransitionProps } from "@mui/material/transitions";
import * as React from "react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { foodExchangeDictionary } from "../../../constants/dictionary";
import { HTTP_PATCH } from "../../../constants/httpMethods";
import {
  initialAddress,
  initialProductMZWZ,
} from "../../../constants/initialProduct";
import { foodExchangeUrl } from "../../../constants/url/foodExchange";
import {
  CreateMapAddressType,
  CreateProductType,
  DeliveryToUser,
} from "../../../type/mzwz";
import fetchWithAuthorization from "../../../utils/axios/fetchWrapper";
import DetailsReceiptStep from "../../../utils/detailsReceiptProduct/DetalisReceiptProductStep";
import snackbarTranslated from "../../../utils/snackbar/snackbarTranslated";
import DetailsDeliveryStep from "./DetailsDeliveryStep";
import DetailsProduct from "./DetailsProductStep";
import { reservationDeliverySteps } from "./Steps";

const translation = "Tabs.AllDeliveries.MakeReservationStepper.";

interface MakeReservationDeliveryToUserStepperProps {
  open: boolean;
  onClose: () => void;
  deliveryToUser: DeliveryToUser;
  index: number;
  removeDeliveryFromList: (index: number) => void;
}

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

function MakeReservationDeliveryToUser({
  open,
  onClose,
  deliveryToUser,
  index,
  removeDeliveryFromList,
}: MakeReservationDeliveryToUserStepperProps) {
  const [activeStep, setActiveStep] = useState(0);
  const { t } = useTranslation(foodExchangeDictionary);
  const theme = useTheme();

  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [createdProduct, setCreatedProduct] =
    useState<CreateProductType>(initialProductMZWZ);
  const [createdMapAddress, setCreatedMapAddress] =
    useState<CreateMapAddressType>(initialAddress);

  const steps = reservationDeliverySteps(t, activeStep);

  const handleReservationDelivery = async () => {
    const redDeliveryToUserId = deliveryToUser.id;
    const path = "deliveryState";

    const requestOptions = {
      body: JSON.stringify({
        value: "RESERVED",
      }),
      headers: {
        "If-Match": deliveryToUser.etag,
      },
    };

    await fetchWithAuthorization(
      `${foodExchangeUrl}deliveryToUser/${redDeliveryToUserId}/${path}`,
      HTTP_PATCH,
      requestOptions
    )
      .then((res: Response) => {
        res
          .json()
          .then((resAxios) => {
            if (res.ok) {
              snackbarTranslated(
                t(translation + "ReservationSnackbar.success"),
                "success"
              );
              removeDeliveryFromList(index);
              return;
            }
            if (resAxios.key !== undefined) {
              snackbarTranslated(resAxios.key, "error");
            } else {
              throw new Error();
            }
          })
          .catch((error) => {
            snackbarTranslated(
              t(translation + "ReservationSnackbar.error"),
              "error"
            );
          });
      })
      .catch((error) => {
        snackbarTranslated(t("noItemsSec.end"), "error");
      });
  };

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      TransitionComponent={Transition}
      keepMounted
      sx={{
        "& .MuiDialog-container": {
          "& .MuiPaper-root": {
            width: "100%",
            maxWidth: {
              xs: "100%",
              sm: "90%",
              md: "85%",
              lg: "70%",
              xl: "40%",
            },
          },
        },
      }}
    >
      <DialogTitle>
        <Stepper activeStep={activeStep}>
          {steps.map((step, index) => {
            const stepProps: { completed?: boolean } = {};
            return (
              <Step key={index} {...stepProps}>
                <StepLabel icon={<StepIcon icon={step.icon} />}>
                  {step.label && !isMobile && step.label}
                </StepLabel>
              </Step>
            );
          })}
        </Stepper>
      </DialogTitle>
      <DialogContent>
        {activeStep === steps.length && (
          <Typography sx={{ mt: 2, mb: 1 }}>
            {t(translation + "FinishStep.message")}
          </Typography>
        )}
        {activeStep === 0 && (
          <DetailsProduct
            deliveryToUserProduct={deliveryToUser.exchange.product}
            handleNext={handleNext}
          />
        )}
        {activeStep === 1 && (
          <DetailsReceiptStep
            deliveryToUserProduct={deliveryToUser.exchange.product}
            handleNext={handleNext}
            handleBack={handleBack}
          />
        )}
        {activeStep === 2 && (
          <DetailsDeliveryStep
            deliveryToUserMap={deliveryToUser.mapAddress}
            handleFinish={handleReservationDelivery}
            handleBack={handleBack}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

export default MakeReservationDeliveryToUser;
