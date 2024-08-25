import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
} from "@mui/material";
import Cookies from "js-cookie";
import jwt_decode from "jwt-decode";
import router from "next/router";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { secondary } from "../../constants/colors";
import { HTTP_UNAUTHORIZED } from "../../constants/httpCodes";
import { HTTP_POST } from "../../constants/httpMethods";
import { UNIT_KILOGRAMS } from "../../constants/productUnits";
import { QUANTITY_REGEX } from "../../constants/regex";
import { TOKEN } from "../../constants/variables";
import { LatLng, ProductList } from "../../type/mzls";
import fetchWithAuthorization from "../../utils/axios/fetchWrapper";
import { Categories } from "../../utils/categories/categories";
import { isFile } from "../../utils/fileType/isFile";
import snackbar from "../../utils/snackbar/snackbar";
import { adjustUnit } from "../../utils/unit/adjustUnit";
import { AddProductFormValidation } from "../../utils/validation/MzlsFormsValidation";
import BarcodeScannerDialog from "./BarcodeScannerDialog";
import UnitSelection from "./useFormInput/CheckboxListInput";
import FileInput from "./useFormInput/FileInput";
import SelectInput from "./useFormInput/SelectInput";
import TextInput from "./useFormInput/TextInput";

interface AddProductProps {
  onProductAdded: (products: ProductList[]) => void;
  socialFridgeId: number;
  isOpen: boolean;
  onClose: () => void;
  t: Function;
  userLocation?: LatLng;
}

type TFormValues = {
  title: string;
  description: string;
  size: string;
  productUnit: string;
  categories: string[];
  date: Date;
  image: File | any;
  pieces: number;
};

export default function AddProductWithSteps({
  onProductAdded,
  socialFridgeId,
  isOpen,
  onClose,
  t,
  userLocation,
}: AddProductProps) {
  const validationRules = AddProductFormValidation(t);
  const accessToken = Cookies.get(TOKEN);
  const defaultValues: TFormValues = {
    title: "",
    description: "",
    size: "",
    productUnit: UNIT_KILOGRAMS,
    categories: [],
    date: new Date(),
    image: null,
    pieces: 1,
  };
  const { handleSubmit, control, watch, setValue } = useForm({
    defaultValues: defaultValues,
  });

  const [isScannerOpen, setIsScannerOpen] = useState(false);

  const handleScan = (data: string) => {
    if (data) {
      handleSubmitScan(data);
    }
  };

  const handleDialogClose = () => {
    onClose();
  };

  const newProduct = async () => {
    const {
      title,
      description,
      size,
      productUnit,
      categories,
      date,
      image,
      pieces,
    } = watch();
    let imageURL;
    if (isFile(image)) {
      const formData = new FormData();
      formData.append("image", image);

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
    } else {
      imageURL = image;
    }

    const expirationDate = new Date(date);
    expirationDate.setHours(23, 59, 0, 0);

    const postData = {
      socialFridgeId,
      expirationDate,
      title,
      description,
      productUnit,
      size,
      image: imageURL,
      latitude: userLocation?.lat,
      longitude: userLocation?.lng,
      categories,
      pieces,
    };

    const requestOptions = {
      body: JSON.stringify({
        postData: postData,
      }),
    };

    fetchWithAuthorization(
      `/api/social-fridge/products`,
      HTTP_POST,
      requestOptions
    )
      .then((response) => {
        if (response.status === HTTP_UNAUTHORIZED) {
          snackbar("errors.unauthorized", "error", t);
          router.push("/login");
        }
        return response.json().then((data) => {
          if (response.ok) {
            snackbar("fridge.successes.newProduct", "success", t);
            onProductAdded(data.product);
          } else if (data.error.key !== undefined) {
            snackbar(`errors.${data.error.key}`, "error", t);
          }
        });
      })
      .catch(() => {
        snackbar("errors.newProductError", "error", t);
      });

    onClose();
  };

  const handleSubmitScan = (scannedCode: string) => {
    fetch(`/api/openFoodFacts?scannedCode=${scannedCode}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Request failed with status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        if (data !== null && data.product !== undefined) {
          setProductInfo(data);
        }
      })
      .catch((error) => {
        snackbar("errors.productScan", "info", t);
      });
  };

  const setProductInfo = async (data: any) => {
    let quantity;
    let unit;

    const matches = data.product.quantity.match(QUANTITY_REGEX);

    quantity = matches[1];
    unit = matches[2];

    if (accessToken) {
      const decodedToken: any = jwt_decode(accessToken);
      const language = `product_name_${decodedToken.language.toLocaleLowerCase()}`;
      if (data.product.language !== undefined) {
        setValue("title", data.product.language);
      } else {
        setValue("title", data.product.product_name);
      }
    }

    setValue("description", data.product.brands);

    const { adjustedQuantity, adjustedUnit } = adjustUnit(unit, quantity);

    setValue("productUnit", adjustedUnit);
    setValue("size", adjustedQuantity.toString().replace(",", "."));
    setValue("image", data.product.image_small_url);
  };

  const handleDateChange = (date: Date | null) => {
    if (date !== null) setValue("date", date);
  };

  return (
    <>
      <BarcodeScannerDialog
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onCodeScanned={handleScan}
        t={t}
      />

      <Dialog open={isOpen} onClose={handleDialogClose}>
        <DialogTitle>{t("fridge.actions.newProduct")}</DialogTitle>
        <DialogContent>
          <form onSubmit={newProduct}>
            <Grid>
              <Button
                type="button"
                variant="contained"
                style={{ color: secondary }}
                onClick={() => setIsScannerOpen(true)}
              >
                {t("fridge.actions.scan")}
              </Button>
            </Grid>

            <Grid marginTop={2}>
              <Controller
                name="title"
                control={control}
                rules={validationRules.title}
                render={({ field, fieldState }) => (
                  <TextInput
                    label={t("fridge.details.title") + ":*"}
                    autoFocus={true}
                    field={field}
                    fieldState={fieldState}
                  />
                )}
              />
            </Grid>
            <Grid marginTop={2}>
              <Controller
                name="description"
                control={control}
                rules={validationRules.description}
                render={({ field, fieldState }) => (
                  <TextInput
                    label={t("fridge.details.description") + "*"}
                    multiline={true}
                    rows={4}
                    field={field}
                    fieldState={fieldState}
                  />
                )}
              />
            </Grid>

            <Grid marginTop={2}>
              <Controller
                name="size"
                control={control}
                rules={validationRules.size}
                render={({ field, fieldState }) => (
                  <TextInput
                    type="number"
                    label={t("fridge.details.size") + "*"}
                    field={field}
                    fieldState={fieldState}
                  />
                )}
              />
            </Grid>

            <Grid>
              <UnitSelection
                value={watch("productUnit")}
                onChange={(e) => setValue("productUnit", e.target.value)}
              />
            </Grid>

            <Grid marginTop={2}>
              <Controller
                name="pieces"
                control={control}
                rules={validationRules.pieces}
                render={({ field, fieldState }) => (
                  <TextInput
                    type="number"
                    defaultValue="1"
                    label={t("fridge.details.pieces") + "*"}
                    field={field}
                    fieldState={fieldState}
                  />
                )}
              />
            </Grid>

            <Grid marginTop={2}>
              <Controller
                name="categories"
                control={control}
                rules={validationRules.categories}
                render={({ field, fieldState }) => (
                  <SelectInput
                    label={t("categoryLabel") + ": *"}
                    options={Object.values(Categories).map((category) => ({
                      value: category,
                      label: `categories.${category}`,
                    }))}
                    control={control}
                    name="categories"
                    defaultValue={watch("categories")}
                    t={t}
                  />
                )}
              />
            </Grid>

            <Grid marginTop={2}>
              <Controller
                name="date"
                control={control}
                rules={validationRules.date}
                render={({ field, fieldState }) => (
                  <TextInput
                    label={t("fridge.details.expirationDate") + "*"}
                    type="date"
                    inputLabelProps={{ shrink: true }}
                    inputProps={{
                      min: new Date().toISOString().split("T")[0],
                    }}
                    field={field}
                    fieldState={fieldState}
                  />
                )}
              />
            </Grid>

            <Grid marginTop={2}>
              <Controller
                name="image"
                control={control}
                render={({ field }) => (
                  <FileInput field={field} inputProps={{}} t={t} />
                )}
              />
            </Grid>

            <Grid marginTop={2}>
              <Button
                type="submit"
                variant="contained"
                style={{ color: secondary }}
                onClick={handleSubmit(newProduct)}
              >
                {t("fridge.actions.newProduct")}
              </Button>
            </Grid>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
