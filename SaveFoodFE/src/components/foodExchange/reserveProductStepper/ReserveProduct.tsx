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
import { HTTP_POST } from "../../../constants/httpMethods";
import { initialAddress } from "../../../constants/initialProduct";
import { foodExchangeUrl } from "../../../constants/url/foodExchange";
import {
  CreateMapAddressType,
  Product,
  ReservationType,
  ownReceipt,
  volunteerDelivery,
} from "../../../type/mzwz";
import fetchWithAuthorization from "../../../utils/axios/fetchWrapper";
import DetailsReceiptStep from "../../../utils/detailsReceiptProduct/DetalisReceiptProductStep";
import snackbarTranslated from "../../../utils/snackbar/snackbarTranslated";
import AddDeliveryLocation from "./AddDeliveryLocation";
import ChoiseReservationType from "./ChoiceReservationType";
import { reservationProductSteps } from "./Steps";
import SummaryReservation from "./SummaryReservation";

const dictionary = "foodExchange";
const textFieldVariant = "standard";
const translation = "Tabs.AllProducts.ReservationStepper.";
const translationRequests = "Tabs.AllProducts.ReservationStepper.Requests.";
const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

interface ReserveProductProps {
  index: number;
  open: boolean;
  onClose: () => void;
  product: Product;
  setUpdatedProduct: { (index: number, changedProduct: Product): void };
}

function ReserveProduct({
  open,
  onClose,
  product,
  setUpdatedProduct,
  index,
}: ReserveProductProps) {
  const [activeStep, setActiveStep] = React.useState(0);
  const { t } = useTranslation(dictionary);
  const [choice, setChoice] = useState<ReservationType>();
  const [exchangeId, setExchangeId] = useState<string>("");
  const steps = reservationProductSteps(t, activeStep, choice);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [isLoading, setIsLoading] = useState(false);
  const [createdMapAddress, setCreatedMapAddress] =
    useState<CreateMapAddressType>(initialAddress);

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleChoiceChange = (newChoice: ReservationType) => {
    setChoice(newChoice);
  };

  const onSubmit = async () => {
    setIsLoading(true);
    await handleReservation();
  };

  const handleReservation = async () => {
    if (createdMapAddress) {
      setIsLoading(false);
      onClose();

      const mapAddress =
        choice === volunteerDelivery ? createdMapAddress : null;
      const requestOptions = {
        body: JSON.stringify({
          mapAddress: mapAddress,
          productId: product.id,
        }),
      };
      await fetchWithAuthorization(
        `${foodExchangeUrl}exchanges`,
        HTTP_POST,
        requestOptions
      )
        .then((res) => {
          res
            .json()
            .then((resAxios) => {
              if (res.ok) {
                snackbarTranslated(
                  t(translationRequests + "ReserveProduct.success"),
                  "success"
                );
                setUpdatedProduct(index, resAxios.exchange.product);
                return;
              }
              if (resAxios.key !== undefined) {
                snackbarTranslated(
                  t(
                    translationRequests + "ReserveProduct.Error." + resAxios.key
                  ),
                  "error"
                );

                return;
              }
              throw new Error();
            })
            .catch((error) => {
              snackbarTranslated(
                t(translationRequests + "ReserveProduct.Error.general"),
                "error"
              );
            });
        })
        .catch((error) => {
          snackbarTranslated(
            t(translationRequests + "ReserveProduct.Error.general"),
            "error"
          );
        });
    }
  };

  const handleUpdateMapAddressDelivery = (
    update: Partial<CreateMapAddressType>
  ) => {
    console.log("Updated map address: ", update);
    setCreatedMapAddress((prevState) => {
      const updatedMapAddress: CreateMapAddressType = {
        ...prevState,
        ...update,
      };
      return updatedMapAddress;
    });
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
              xl: "60%",
            },
          },
        },
      }}
    >
      <DialogTitle>
        <Stepper activeStep={activeStep}>
          {steps.map((step, index) => {
            return (
              <Step key={index}>
                <StepLabel icon={<StepIcon icon={step.icon} />}>
                  {!isMobile && step.label}
                </StepLabel>
              </Step>
            );
          })}
        </Stepper>
      </DialogTitle>
      <DialogContent>
        {activeStep === 0 && (
          <Typography sx={{ m: 1 }}>
            <ChoiseReservationType
              setChoice={handleChoiceChange}
              choice={choice}
              handleNext={handleNext}
            />
          </Typography>
        )}
        <Typography sx={{ mt: 2, mb: 1 }}>
          {activeStep === 1 && choice === volunteerDelivery && (
            <AddDeliveryLocation
              createdMapAddress={createdMapAddress}
              handleNext={handleNext}
              handleBack={handleBack}
              handleUpdateMapAddressDelivery={handleUpdateMapAddressDelivery}
            />
          )}
          {activeStep === 1 && choice === ownReceipt && (
            <DetailsReceiptStep
              deliveryToUserProduct={product}
              handleNext={handleNext}
              handleBack={handleBack}
            />
          )}
          {activeStep === 2 && (
            <SummaryReservation
              product={product}
              handleFinish={onSubmit}
              handleBack={handleBack}
            />
          )}
        </Typography>
        <Typography sx={{ mt: 2, mb: 1 }}></Typography>
      </DialogContent>
    </Dialog>
  );
}

export default ReserveProduct;
