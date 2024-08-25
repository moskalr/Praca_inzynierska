import ArrowBackIosNewRoundedIcon from "@mui/icons-material/ArrowBackIosNewRounded";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import {
  Button,
  Container,
  FormControl,
  Grid,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { primary } from "../../../constants/colors";
import { eaaDictionary } from "../../../constants/dictionary";
import { HTTP_POST } from "../../../constants/httpMethods";
import { productCategories } from "../../../constants/productCategories";
import { CreateProductMZWO } from "../../../type/mzwo";
import snackbar from "../../../utils/snackbar/snackbar";
import { EaaFormsValidation } from "../../../utils/validation/EaaFormsValidation";
import ConfirmationDialog from "../../confirm/ConfirmationDialog";

const textFieldVariant = "outlined";

interface CreateProductProps {
  createdProduct: CreateProductMZWO;
  handleBack: () => void;
  handleComplete: () => void;
  handleCreateProduct: (createdProduct: CreateProductMZWO) => void;
}

interface CreateProductForm {
  productName: string;
  category: string;
  image: File | null;
}

function CreateProduct({
  createdProduct,
  handleBack,
  handleComplete,
  handleCreateProduct,
}: CreateProductProps) {
  const { t } = useTranslation(eaaDictionary);
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<CreateProductForm>();

  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isConfirmationDialogOpen, setIsConfirmationDialogOpen] =
    useState(false);
  const validationRules = EaaFormsValidation(t);

  const onSubmit = async (data: CreateProductForm) => {
    let updatedProduct = {
      productName: data.productName,
      category: data.category,
      image: "",
    };
    if (data.image) {
      const formData = new FormData();
      formData.append("image", data.image);

      try {
        const response = await fetch("/api/cloudinary", {
          method: HTTP_POST,
          body: formData,
        });

        if (!response.ok) {
          throw new Error(
            `Request to Cloudinary failed with status: ${response.status}`
          );
        }

        const cloudinaryData = await response.json();
        const imageURL = cloudinaryData.imageUrl;
        setPreviewImage(imageURL);
        updatedProduct.image = imageURL;
      } catch (error) {
        snackbar("events.snackbar.errorMessage.cloudinaryUpload", "info", t);
      }
    }
    await handleCreateProduct(updatedProduct);
    handleConfirmationDialogOpen();
  };

  const handleConfirmationDialogOpen = () => {
    setIsConfirmationDialogOpen((prev) => !prev);
  };

  return (
    <Container sx={{ marginTop: "1vh", marginBottom: "1vh", overflow: "auto" }}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack direction="column" justifyContent="space-between" spacing={2}>
          <TextField
            type="text"
            fullWidth
            variant={textFieldVariant}
            defaultValue={createdProduct.productName}
            {...register("productName", { ...validationRules.productName })}
            label={t("events.product.name") + " *"}
            size="small"
            error={!!errors.productName}
            helperText={errors.productName && errors.productName.message}
          />

          <Typography>
            <TextField
              select
              label={t("events.product.category") + " *"}
              variant={textFieldVariant}
              defaultValue={createdProduct.category}
              size="small"
              {...register("category", { ...validationRules.category })}
              sx={{ width: "50%" }}
              error={!!errors.category}
              helperText={errors.category && errors.category.message}
            >
              {productCategories.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {t(`category.${option.value.toLowerCase()}`)}
                </MenuItem>
              ))}
            </TextField>
          </Typography>

          <FormControl>
            <Controller
              name="image"
              control={control}
              render={({ field }) => (
                <>
                  <input
                    type="file"
                    accept="image/*"
                    id="image-upload"
                    capture="environment"
                    style={{ display: "none" }}
                    onChange={(e) => {
                      const selectedImage = e.target.files?.[0];
                      field.onChange(selectedImage);
                      if (selectedImage) {
                        const imageUrl = URL.createObjectURL(selectedImage);
                        setPreviewImage(imageUrl);
                      }
                    }}
                  />
                  <label htmlFor="image-upload">
                    <IconButton style={{ color: primary }} component="span">
                      <PhotoCameraIcon />
                    </IconButton>
                    {t("events.stepper.image")}
                  </label>
                  {previewImage && (
                    <img src={previewImage} alt="Selected Image" />
                  )}
                </>
              )}
            />
          </FormControl>

          <Grid
            container
            justifyContent="space-evenly"
            sx={{ marginTop: "1vh", marginBottom: "1vh" }}
            xs={12}
          >
            <Grid item xs={6}>
              <Button
                startIcon={<ArrowBackIosNewRoundedIcon />}
                onClick={handleBack}
                variant="contained"
                sx={{
                  width: "30%",
                  backgroundColor: "secondary.main",
                  color: "white",
                  float: "left",
                }}
              >
                {t("events.stepper.back")}
              </Button>
            </Grid>
            <Grid item xs={6}>
              <Button
                type="submit"
                variant="contained"
                sx={{
                  width: "30%",
                  backgroundColor: "secondary.main",
                  color: "white",
                  float: "right",
                }}
              >
                {t("events.stepper.save")}
              </Button>
            </Grid>
          </Grid>
        </Stack>
      </form>
      <ConfirmationDialog
        isOpen={isConfirmationDialogOpen}
        onClose={handleConfirmationDialogOpen}
        onConfirm={handleComplete}
        message={t("events.stepper.confirmDialog")}
        t={t}
      />
    </Container>
  );
}

export default CreateProduct;
