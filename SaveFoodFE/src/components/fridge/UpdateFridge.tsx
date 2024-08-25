import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  TextField,
} from "@mui/material";
import router from "next/router";
import { Controller, useForm } from "react-hook-form";
import DeleteProduct from "../../components/fridge/DeleteProduct";
import { secondary } from "../../constants/colors";
import { HTTP_NO_CONTENT, HTTP_UNAUTHORIZED } from "../../constants/httpCodes";
import { HTTP_POST, HTTP_PUT } from "../../constants/httpMethods";
import styles from "../../styles/fridge.module.css";
import { LatLng, SocialFridge } from "../../type/mzls";
import fetchWithAuthorization from "../../utils/axios/fetchWrapper";
import snackbar from "../../utils/snackbar/snackbar";
import { AddProductFormValidation } from "../../utils/validation/MzlsFormsValidation";

interface UpdateFridgeProps {
  socialFridge: SocialFridge;
  isOpen: boolean;
  onClose: () => void;
  t: Function;
  userLocation?: LatLng;
}

type TFormValues = {
  description: string;
  image: File | null;
  productsId: number[];
};

export default function UpdateFridge({
  socialFridge,
  isOpen,
  onClose,
  t,
  userLocation,
}: UpdateFridgeProps) {
  const validationRules = AddProductFormValidation(t);
  const defaultValues: TFormValues = {
    description: "",
    image: null,
    productsId: [],
  };
  const { handleSubmit, control, watch, setValue, reset } = useForm({
    defaultValues: defaultValues,
  });

  const selectedProductIds = watch("productsId", []);

  const handleDialogClose = () => {
    onClose();
  };

  const handleProductCheckboxChange = (productId: number) => {
    const updatedSelectedProductIds = selectedProductIds.includes(productId)
      ? selectedProductIds.filter((id: number) => id !== productId)
      : [...selectedProductIds, productId];

    setValue("productsId", updatedSelectedProductIds);
  };

  const newProduct = async () => {
    const { description, image, productsId } = watch();
    let imageURL;

    const formData = new FormData();

    if (image !== null) {
      formData.append("image", image);
    }

    await fetch("/api/cloudinary", {
      method: HTTP_POST,
      body: formData,
    })
      .then((response) => {
        if (!response.ok) {
          `Request to Cloudinary failed with status: ${response.status}`;
        }
        return response.json().then(async (cloudinaryData) => {
          imageURL = await cloudinaryData.imageUrl;
        });
      })
      .catch(() => {
        snackbar("errors.cloudinary", "info", t);
      });

    const socialFridgeId = socialFridge.id;

    const putData = {
      products: productsId,
      socialFridgeId,
      description,
      latitude: userLocation?.lat,
      longitude: userLocation?.lng,
      image: imageURL,
    };

    const requestOptions = {
      body: JSON.stringify({
        putData: putData,
      }),
    };

    await fetchWithAuthorization(
      `/api/social-fridge/fridge/${socialFridgeId}`,
      HTTP_PUT,
      requestOptions
    )
      .then(async (response) => {
        if (response.status === HTTP_NO_CONTENT) {
          snackbar("fridge.successes.notifications_success", "success", t);
          reset(defaultValues);
          onClose();
        } else if (response.status === HTTP_UNAUTHORIZED) {
          snackbar("errors.unauthorized", "error", t);
          router.push("/login");
        } else {
          const data = await response.json();
          if (data?.error?.key !== undefined) {
            snackbar(`errors.${data.error.key}`, "error", t);
          }
        }
      })
      .catch(() => {
        snackbar("errors.notifications_error", "error", t);
      });
  };

  return (
    <Dialog open={isOpen} onClose={handleDialogClose}>
      <DialogTitle>{t("fridge.messages.update_fridge_title")}</DialogTitle>
      <DialogContent>
        <form onSubmit={newProduct}>
          {socialFridge && (
            <div className={styles["product-grid"]}>
              {t("fridge.messages.select_products_not_in_fridge")}
              <DeleteProduct
                products={socialFridge.products}
                selectedProductIds={selectedProductIds}
                onProductCheckboxChange={handleProductCheckboxChange}
                t={t}
              />
            </div>
          )}

          <Grid
            container
            justifyContent="center"
            alignItems="center"
            marginTop={2}
          >
            <Controller
              name="image"
              control={control}
              rules={validationRules.image}
              render={({ field, fieldState }) => (
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
                    }}
                  />
                  <label htmlFor="image-upload">
                    <IconButton style={{ color: secondary }} component="span">
                      <PhotoCameraIcon />
                    </IconButton>
                    {t("fridge.actions.image")}
                  </label>
                  {field.value && (
                    <img
                      src={URL.createObjectURL(field.value)}
                      alt="Selected Image"
                      style={{ width: 110, height: 110 }}
                    />
                  )}
                  {fieldState.invalid && (
                    <p style={{ color: "red" }}>{fieldState.error?.message}</p>
                  )}
                </>
              )}
            />
          </Grid>

          <Grid
            container
            justifyContent="center"
            alignItems="center"
            marginTop={2}
          >
            <Controller
              name="description"
              control={control}
              rules={validationRules.description}
              render={({ field, fieldState }) => (
                <TextField
                  label={t("fridge.details.description")}
                  multiline
                  rows={4}
                  {...field}
                  error={!!fieldState.error}
                  helperText={fieldState.error ? fieldState.error.message : ""}
                  InputLabelProps={{
                    style: { color: secondary },
                  }}
                />
              )}
            />
          </Grid>

          <Grid
            container
            justifyContent="center"
            alignItems="center"
            marginTop={2}
          >
            <Button
              type="submit"
              variant="contained"
              style={{ color: secondary }}
              onClick={handleSubmit(newProduct)}
            >
              {t("fridge.messages.send_update")}
            </Button>
          </Grid>
        </form>
      </DialogContent>
    </Dialog>
  );
}
