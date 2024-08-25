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
import { TransitionProps } from "@mui/material/transitions";
import Cookies from "js-cookie";
import * as React from "react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { foodExchangeDictionary } from "../../../constants/dictionary";
import { HTTP_POST } from "../../../constants/httpMethods";
import {
  initialAddress,
  initialProductMZWZ,
} from "../../../constants/initialProduct";
import { foodExchangeUrl } from "../../../constants/url/foodExchange";
import { TOKEN } from "../../../constants/variables";
import { CreateMapAddressType, CreateProductType } from "../../../type/mzwz";
import fetchWithAuthorization from "../../../utils/axios/fetchWrapper";
import snackbarTranslated from "../../../utils/snackbar/snackbarTranslated";
import { useProductDate } from "../hook/useProductDate";
import AddLocationProduct from "./AddLocationProduct";
import AddProductAvailability from "./AddProductAvailability";
import CreateProductMZWZ from "./CreateProductMZWZ";
import { addProductSteps } from "./Steps";

const translation = "Tabs.OwnProducts.AddProductStepper.";
const translationAddProductStepperRequests =
  "Tabs.OwnProducts.AddProductStepper.Requests.";
interface AddProductStepperProps {
  open: boolean;
  onClose: () => void;
}

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

function AddProductStepper({ open, onClose }: AddProductStepperProps) {
  const [activeStep, setActiveStep] = useState(0);
  const { t } = useTranslation(foodExchangeDictionary);
  const theme = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const steps = addProductSteps(t, activeStep);
  const accessToken = Cookies.get(TOKEN);
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [createdProduct, setCreatedProduct] =
    useState<CreateProductType>(initialProductMZWZ);
  const [createdMapAddress, setCreatedMapAddress] =
    useState<CreateMapAddressType>(initialAddress);
  const handleUpdateProduct = (update: Partial<CreateProductType>) => {
    setCreatedProduct((prevState) => ({ ...prevState, ...update }));
  };

  const handleUpdateMapAddressProduct = (
    update: Partial<CreateMapAddressType>
  ) => {
    setCreatedMapAddress((prevState) => {
      const updatedMapAddress: CreateMapAddressType = {
        ...prevState,
        ...update,
      };
      handleUpdateProduct({ mapAddress: updatedMapAddress });
      return updatedMapAddress;
    });
  };

  const { dates, handleResetDate, handleUpdate } = useProductDate({
    handleProductUpdate: handleUpdateProduct,
  });

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const onSubmit = async () => {
    setIsLoading(true);
    await handleSaveProduct(createdProduct);
  };

  const handleSaveProduct = async (createdProduct: CreateProductType) => {
    if (createdProduct) {
      setIsLoading(false);
      onClose();

      const requestOptions = {
        body: JSON.stringify(createdProduct),
      };

      await fetchWithAuthorization(
        `${foodExchangeUrl}product/products`,
        HTTP_POST,
        requestOptions
      )
        .then((res) => {
          res
            .json()
            .then((resAxios) => {
              if (res.ok) {
                snackbarTranslated(
                  t(
                    translationAddProductStepperRequests + "AddProduct.success"
                  ),
                  "success"
                );
                return;
              }
              if (resAxios.key !== undefined) {
                snackbarTranslated(
                  t(
                    translationAddProductStepperRequests +
                      "AddProduct.Error" +
                      resAxios.key
                  ),
                  "error"
                );
                return;
              }
              throw new Error();
            })
            .catch((error) => {
              snackbarTranslated(
                t(
                  translationAddProductStepperRequests +
                    "AddProduct.Error.general"
                ),
                "error"
              );
            });
        })
        .catch((error) => {
          snackbarTranslated(
            t(
              translationAddProductStepperRequests + "AddProduct.Error.general"
            ),
            "error"
          );
        });
    }
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
            const stepProps: { completed?: boolean } = {};
            return (
              <Step key={index} {...stepProps}>
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
          <CreateProductMZWZ
            createdProduct={createdProduct}
            handleNext={handleNext}
            handleUpdateDate={handleUpdate}
            selectedExpirationDate={dates.expirationDate}
            handleUpdateProduct={handleUpdateProduct}
          />
        )}
        {activeStep === 1 && (
          <AddProductAvailability
            createdProduct={createdProduct}
            handleNext={handleNext}
            handleBack={handleBack}
            handleUpdate={handleUpdate}
            dates={dates}
            handleUpdateProduct={handleUpdateProduct}
          />
        )}
        {activeStep === 2 && (
          <AddLocationProduct
            createdMapAddress={createdMapAddress}
            handleCreate={onSubmit}
            handleBack={handleBack}
            handleUpdateMapAddressProduct={handleUpdateMapAddressProduct}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

export default AddProductStepper;
