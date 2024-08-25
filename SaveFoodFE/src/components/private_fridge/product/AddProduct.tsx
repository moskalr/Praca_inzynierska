import AddIcon from "@mui/icons-material/Add";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DocumentScannerIcon from "@mui/icons-material/DocumentScanner";
import FastfoodIcon from "@mui/icons-material/Fastfood";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
} from "@mui/material";
import InputAdornment from "@mui/material/InputAdornment";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import { useTranslation } from "next-i18next";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { HTTP_OK } from "../../../constants/httpCodes";
import { HTTP_POST } from "../../../constants/httpMethods";
import styles from "~/styles/private_fridge.module.css";
import fetchWithAuthorization from "../../../utils/axios/fetchWrapper";
import { outlinedInputStyles } from "../../../utils/custom_mui_style/style";
import { productDefaultValues } from "../../../utils/default_values/pf_default_values";
import { isFile } from "../../../utils/fileType/isFile";
import snackbar from "../../../utils/snackbar/snackbar";
import { productCategories } from "../../../utils/categories/pf_product_categories";
import LoadingState from "../../../utils/loading_spinner/LoadingSpinner";
import CustomTextField from "../useFrom/CustomTextField";
import { validation } from "../validation/Validation";
import ScannerWindow from "./barcode/ScannerWindow";
import uploadImageToCloudinary from "./uploadImageToCloudinary";

const dictionary = "private_fridge";

interface Props {
  fridgeId: number;
}

function AddProduct({ fridgeId }: Props) {
  const { t } = useTranslation(dictionary);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  const formValidation = validation(t);

  const handleScan = (data: string) => {
    if (data && !isScannerOpen) {
      handleSubmitScan(data);
    }
  };

  const {
    control,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { isSubmitting },
  } = useForm({
    defaultValues: productDefaultValues,
  });

  const { unitOfMeasure, image } = watch();

  type imageResponse = {
    url: string;
    [key: string]: any;
  };

  const onProductSubmit = async (data: PoductFormValues) => {
    if (isFile(data.image)) {
      const imageData: imageResponse = await uploadFile(data.image);
      data.image = imageData.url;
    }
    await addProduct(data);
  };

  const fillProductForm = (data: any) => {
    setValue("name", data.title);
    setValue("description", data.description);
    setValue("quantity", data.servings.size);
    setValue("image", data.image);
  };

  const handleSubmitScan = (scannedCode: string) => {
    fetch(`/api/private-fridge/spoonacular/food?scannedCode=${scannedCode}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Request failed with status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        if (data !== null && data.status !== "failure") {
          fillProductForm(data);
          return;
        }
        snackbar("info_message.find_product", "info", t);
        return;
      })
      .catch((error) => {
        snackbar("error_message.find_product", "error", t);
      });
  };

  const addProduct = async (data: any) => {
    try {
      data.privateFridgeId = fridgeId;
      const expirationDate = new Date(data.expirationDate);
      expirationDate.setHours(23, 59, 0, 0);
      data.expirationDate = expirationDate;

      const requestOptions = {
        body: JSON.stringify({ data }),
      };

      const response = await fetchWithAuthorization(
        `/api/private-fridge/products/product`,
        HTTP_POST,
        requestOptions
      );
      if (response.status === HTTP_OK) {
        const data = await response.json();
        snackbar("success_message.add_product", "success", t);
        reset();
      } else {
        snackbar("error_message.add_product", "error", t);
      }
    } catch (error) {
      snackbar("error_message.add_product", "error", t);
    }
  };

  const uploadFile = async (file: File | any) =>
    uploadImageToCloudinary(file)
      .then((response) => {
        snackbar("success_message.image_upload", "success", t);
        return response;
      })
      .catch((error) => {
        snackbar("error_message.image_upload", "error", t);
        return null;
      });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedImage = e.target.files?.[0];
    setValue("image", selectedImage);
  };

  return (
    <>
      <LoadingState open={isSubmitting} />
      <IconButton
        aria-label="expand row"
        size="small"
        onClick={() => setIsFormOpen(true)}
      >
        <AddIcon />
      </IconButton>

      <ScannerWindow
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onCodeScanned={handleScan}
        t={t}
      />

      <Dialog open={isFormOpen} onClose={() => setIsFormOpen(false)}>
        <DialogTitle
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ textAlign: "left" }}>{t("products.form.title")}</div>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setIsScannerOpen(true)}
          >
            <DocumentScannerIcon />
          </IconButton>
        </DialogTitle>
        <DialogContentText
          style={{
            marginLeft: "20px",
          }}
        >
          {t("products.form.description")}
        </DialogContentText>

        <form onSubmit={handleSubmit(onProductSubmit)}>
          <DialogContent>
            <Controller
              name="name"
              control={control}
              rules={formValidation.product.name}
              render={({ field, fieldState }) => (
                <CustomTextField
                  label={t("products.form.name")}
                  type="text"
                  required
                  autoFocus
                  fullWidth
                  field={field}
                  fieldState={fieldState}
                />
              )}
            />
            <Controller
              name="description"
              control={control}
              rules={formValidation.product.description}
              render={({ field, fieldState }) => (
                <CustomTextField
                  label={t("products.form.product_description")}
                  type="text"
                  fullWidth
                  multiline
                  field={field}
                  fieldState={fieldState}
                />
              )}
            />
          </DialogContent>
          <DialogContent
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Controller
              name="quantity"
              control={control}
              rules={formValidation.product.quantity}
              render={({ field, fieldState }) => (
                <CustomTextField
                  label={t("products.form.quantity")}
                  type="number"
                  required
                  sx={{ width: "50%" }}
                  field={field}
                  fieldState={fieldState}
                  inputProps={{ min: 1 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        {unitOfMeasure === "GRAMS" ? "g" : "ml"}
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />

            <FormControl variant="outlined" sx={outlinedInputStyles}>
              <InputLabel color="secondary">
                {t("products.form.unit")}
              </InputLabel>
              <Controller
                name="unitOfMeasure"
                control={control}
                rules={formValidation.product.unitOfMeasure}
                render={({ field, fieldState }) => (
                  <Select
                    label={t("products.form.unit")}
                    sx={{ width: "70px" }}
                    {...field}
                    error={!!fieldState.error}
                  >
                    <MenuItem value={"GRAMS"}>g</MenuItem>
                    <MenuItem value={"MILLILITERS"}>ml</MenuItem>
                  </Select>
                )}
              />
            </FormControl>
            <Controller
              name="amount"
              control={control}
              rules={formValidation.product.amount}
              render={({ field, fieldState }) => (
                <CustomTextField
                  label={t("products.form.amount")}
                  type="number"
                  required
                  sx={{ width: "20%" }}
                  field={field}
                  fieldState={fieldState}
                  inputProps={{ min: 1 }}
                />
              )}
            />
          </DialogContent>
          <DialogContent
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <FormControl
              variant="outlined"
              className={styles["select-category"]}
              sx={outlinedInputStyles}
            >
              <InputLabel color="secondary">
                {t("products.form.category")}
              </InputLabel>
              <Controller
                name="productCategory"
                control={control}
                rules={formValidation.product.productCategory}
                render={({ field, fieldState }) => (
                  <Select
                    label={t("products.form.category")}
                    {...field}
                    error={!!fieldState.error}
                    MenuProps={{
                      PaperProps: {
                        style: {
                          maxHeight: 200,
                        },
                      },
                    }}
                  >
                    {productCategories.map((category) => (
                      <MenuItem value={category}>
                        {t(`products.category.${category}`.toLowerCase())}
                      </MenuItem>
                    ))}
                  </Select>
                )}
              />
            </FormControl>
            <Controller
              name="expirationDate"
              control={control}
              rules={formValidation.product.expirationDate}
              render={({ field, fieldState }) => (
                <CustomTextField
                  label={t("products.form.expiration_date")}
                  type="date"
                  required
                  sx={{ width: "45%" }}
                  field={field}
                  fieldState={fieldState}
                  inputProps={{
                    min: new Date().toISOString().split("T")[0],
                  }}
                  InputLabelProps={{ shrink: true }}
                />
              )}
            />
          </DialogContent>
          <DialogContent
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <Controller
              name="daysToEat"
              control={control}
              rules={formValidation.product.daysToEat}
              render={({ field, fieldState }) => (
                <CustomTextField
                  label={t("products.form.shelf_life_after_opening")}
                  type="number"
                  required
                  sx={{ width: "50%", marginRight: "5%" }}
                  field={field}
                  fieldState={fieldState}
                  inputProps={{ min: 1 }}
                  InputLabelProps={{ shrink: true }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        {t("products.form.days")}
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />
            <Button
              htmlFor="image-upload"
              component="label"
              variant="contained"
              startIcon={<CloudUploadIcon />}
              sx={{ width: "30%", marginRight: "2%" }}
            >
              {t("products.form.image")}
            </Button>
            {!image ? (
              <FastfoodIcon style={{ width: "80px", height: "80px" }} />
            ) : (
              <img
                src={isFile(image) ? URL.createObjectURL(image) : image}
                style={{ width: 80, height: 80 }}
              />
            )}
            <input
              type="file"
              accept="image/*"
              id="image-upload"
              capture="environment"
              style={{ display: "none" }}
              onChange={handleFileChange}
            />
          </DialogContent>
          <DialogActions className={styles["dialog-action"]}>
            <Button onClick={() => setIsFormOpen(false)}>
              {t("create_private_fridge.cancel")}
            </Button>
            <Button onClick={() => reset()}>
              {t("create_private_fridge.clear")}
            </Button>
            <Button type="submit">{t("products.form.add")}</Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  );
}

export default AddProduct;
