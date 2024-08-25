import LocalDiningIcon from "@mui/icons-material/LocalDining";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  TextField,
} from "@mui/material";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import { useTranslation } from "next-i18next";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { HTTP_OK } from "../../../constants/httpCodes";
import { HTTP_GET, HTTP_PUT } from "../../../constants/httpMethods";
import { DONATED, EATEN, THROWN_AWAY } from "../../../constants/productStatus";
import fetchWithAuthorization from "../../../utils/axios/fetchWrapper";
import snackbar from "../../../utils/snackbar/snackbar";
import LoadingState from "../../../utils/loading_spinner/LoadingSpinner";
import { validation } from "../validation/Validation";
import styles from "~/styles/private_fridge.module.css";
import CustomTextField from "../useFrom/CustomTextField";
import { outlinedInputStyles } from "../../../utils/custom_mui_style/style";

const dictionary = "private_fridge";

interface Props {
  productId: number;
  currentQuentity: number;
}

function TakeOutProduct({ productId, currentQuentity }: Props) {
  const { t } = useTranslation(dictionary);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [productTag, setProductTag] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const formValidation = validation(t);

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm({
    defaultValues: {
      quantity: currentQuentity,
      productStatus: EATEN,
    },
  });

  const onSubmit = async (data: any) => {
    await takeOutProduct(data);
    setIsFormOpen(false);
  };

  const handleOpenDialog = async () => {
    setIsLoading(true);
    await getProductForEtag();
  };

  const getProductForEtag = async () => {
    try {
      const response = await fetchWithAuthorization(
        `/api/private-fridge/products/${productId}`,
        HTTP_GET
      );

      const data = await response.json();
      if (response.ok) {
        setProductTag(data.etag);
        setIsLoading(false);
        setIsFormOpen(true);
        return;
      } else if (data.key !== undefined) {
        snackbar(data.key, "error", t);
      }
    } catch (error) {
      snackbar("snackbar.errorMessage.default", "error", t);
    }
  };

  const takeOutProduct = async (formData: any) => {
    try {
      const requestOptions = {
        body: JSON.stringify({
          quantity: formData.quantity,
          productStatus: formData.productStatus,
        }),
        headers: {
          "If-Match": productTag,
        },
      };

      const response = await fetchWithAuthorization(
        `/api/private-fridge/products/${productId}`,
        HTTP_PUT,
        requestOptions
      );
      if (response.status === HTTP_OK) {
        snackbar("success_message.private_fridge_create", "success", t);
      } else {
        snackbar("error_message.private_fridge_create_error", "error", t);
      }
    } catch (error) {
      snackbar("error_message.private_fridge_create_error", "error", t);
    }
  };

  return (
    <>
      <LoadingState open={isLoading || isSubmitting} />
      <IconButton
        aria-label="expand row"
        size="small"
        onClick={() => handleOpenDialog()}
      >
        <LocalDiningIcon />
      </IconButton>
      <Dialog open={isFormOpen} onClose={() => setIsFormOpen(false)}>
        <DialogTitle>
          Wybierz czynność jaką chcesz dokonać na produkcie
        </DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <Controller
              name="quantity"
              control={control}
              rules={formValidation.fridge.title}
              render={({ field, fieldState }) => (
                <CustomTextField
                  label={t("create_private_fridge.fridge_title")}
                  fullWidth
                  type="text"
                  required
                  field={field}
                  fieldState={fieldState}
                />
              )}
            />
            <FormControl
              variant="outlined"
              className={styles["select-product-status"]}
              sx={outlinedInputStyles}
            >
              <InputLabel color="secondary">
                {t("products.form.category")}
              </InputLabel>
              <Controller
                name="productStatus"
                control={control}
                rules={formValidation.product.productCategory}
                render={({ field, fieldState }) => (
                  <Select
                    label={t("products.form.category")}
                    {...field}
                    error={!!fieldState.error}
                  >
                    <MenuItem value={EATEN}>Zjedz</MenuItem>
                    <MenuItem value={THROWN_AWAY}>Wyrzuć</MenuItem>
                    <MenuItem value={DONATED}>Oddaj</MenuItem>
                  </Select>
                )}
              />
            </FormControl>
          </DialogContent>
          <DialogActions className={styles["dialog-action"]}>
            <Button onClick={() => setIsFormOpen(false)}>
              {t("create_private_fridge.cancel")}
            </Button>
            <Button type="submit">Wykonaj</Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  );
}

export default TakeOutProduct;
