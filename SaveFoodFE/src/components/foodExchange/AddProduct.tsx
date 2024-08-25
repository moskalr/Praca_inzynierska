import { Fab } from "@mui/material";
import Cookies from "js-cookie";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { foodExchangeDictionary } from "../../constants/dictionary";
import { TOKEN } from "../../constants/variables";
import AddProductStepper from "./addProductStepper/AddProductStepper";

const translation = "Tabs.OwnProducts.";

export function AddProduct() {
  const [isStepperOpen, setIsStepperOpen] = useState(false);
  const { t } = useTranslation(foodExchangeDictionary);
  const handleOpenStepper = () => {
    setIsStepperOpen((prev) => !prev);
  };
  const token = Cookies.get(TOKEN);

  return (
    <>
      {token && (
        <>
          <Fab
            variant="extended"
            color="primary"
            size="large"
            onClick={handleOpenStepper}
            sx={{
              position: "fixed",
              bottom: "3%",
              right: "50%",
              transform: "translate(50%)",
            }}
          >
            {t(translation + "addProductButton")}
          </Fab>
          <>
            {isStepperOpen && (
              <AddProductStepper
                onClose={handleOpenStepper}
                open={isStepperOpen}
              />
            )}
          </>
        </>
      )}
    </>
  );
}

export default AddProduct;
