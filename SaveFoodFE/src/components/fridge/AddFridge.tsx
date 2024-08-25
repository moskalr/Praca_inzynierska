import FmdGoodRoundedIcon from "@mui/icons-material/FmdGoodRounded";
import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  InputLabel,
  Typography,
} from "@mui/material";
import router from "next/router";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import styles from "~/styles/managed_social_fridge.module.css";
import { secondary } from "../../constants/colors";
import { HTTP_UNAUTHORIZED } from "../../constants/httpCodes";
import { HTTP_POST } from "../../constants/httpMethods";
import { Account, LatLng } from "../../type/mzls";
import { fetchAndSetCoordinates } from "../../utils/address/findAddress";
import { createFormattedAddress } from "../../utils/address/formatAddress";
import fetchWithAuthorization from "../../utils/axios/fetchWrapper";
import snackbar from "../../utils/snackbar/snackbar";
import capitalizeFirstLetter from "../../utils/string/capitalizeFirstLetter";
import { AddProductFormValidation } from "../../utils/validation/MzlsFormsValidation";
import MapDialog from "./DialogMap";
import SelectManagerInput from "./useFormInput/SelectManagerInput";
import TextInput from "./useFormInput/TextInput";

interface AddProductProps {
  isOpen: boolean;
  onClose: () => void;
  t: Function;
  userLocation?: LatLng;
  managers: Account[];
}

type TFormValues = {
  username: string;
  street: string;
  buildingNumber: string;
  city: string;
  postalCode: string;
  latitude: number | null;
  longitude: number | null;
};

export default function AddProductWithSteps({
  isOpen,
  onClose,
  t,
  userLocation,
  managers,
}: AddProductProps) {
  const validationRules = AddProductFormValidation(t);
  const defaultValues: TFormValues = {
    username: "",
    street: "",
    buildingNumber: "",
    city: "",
    postalCode: "",
    latitude: null,
    longitude: null,
  };
  const [isMapOpened, setIsMapOpened] = useState(false);
  const { handleSubmit, control, watch, setValue, reset } = useForm({
    defaultValues,
  });
  const { latitude, longitude } = watch();

  const newFridge = async () => {
    const { street, buildingNumber, city, postalCode } = watch();
    const capitalizedCity = capitalizeFirstLetter(city);
    const capitalizedStreet = capitalizeFirstLetter(street);
    if (capitalizedCity && capitalizedStreet) {
      const addressWithoutCoor = createFormattedAddress({
        street: capitalizedStreet,
        streetNumber: buildingNumber,
        city: capitalizedCity,
        postalCode,
        latitude: "",
        longitude: "",
      });

      const response = await fetch(
        `/api/geocodeAddress?address=${addressWithoutCoor}`
      );
      const location = await response.json();

      if (location.message !== "Coordinates not found") {
        setValue("longitude", location.longitude);
        setValue("latitude", location.latitude);

        const { username, latitude, longitude } = watch();

        const address = {
          street: capitalizedStreet,
          buildingNumber,
          city: capitalizedCity,
          postalCode,
          latitude,
          longitude,
        };

        const postData = {
          address,
          username,
        };

        const requestOptions = {
          body: JSON.stringify({
            postData: postData,
          }),
        };
        await fetchWithAuthorization(
          `/api/social-fridge/fridges`,
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
                snackbar("fridge.successes.newFridge", "success", t);
                reset();
                onClose();
              } else if (data.error.key !== undefined) {
                snackbar(`errors.${data.error.key}`, "error", t);
              }
            });
          })
          .catch(() => {
            snackbar("errors.newFridgeError", "error", t);
          });
      } else {
        if (location.message == "Coordinates not found") {
          snackbar("errors.locationNotFoundError", "error", t);
        }
      }
    }
  };

  const handleMapOpened = () => {
    setIsMapOpened((prev) => !prev);
  };

  const handleMap = () => {
    setIsMapOpened(true);
    fetchAndSetCoordinates(watch, setValue, t);
  };

  const handleDialogClose = () => {
    onClose();
  };

  return (
    <>
      <Dialog
        open={isOpen}
        onClose={handleDialogClose}
        className={styles["add-fridge"]}
      >
        <DialogTitle>{t("managedSocialFridge.messages.addFridge")}</DialogTitle>
        <DialogContent>
          <form onSubmit={newFridge}>
            <Grid marginTop={2}>
              <FormControl
                style={{ width: "100%" }}
                variant="outlined"
                size="small"
              >
                <InputLabel
                  shrink
                  htmlFor="username"
                  style={{
                    color: secondary,
                    position: "absolute",
                    top: "-8px",
                  }}
                >
                  {t("managedSocialFridge.messages.manager") + ": *"}
                </InputLabel>
                <Controller
                  name="username"
                  control={control}
                  rules={validationRules.manager}
                  render={({ field, fieldState }) => (
                    <SelectManagerInput
                      field={field}
                      fieldState={fieldState}
                      managers={managers}
                    />
                  )}
                />
                <Grid marginTop={2}>
                  <Controller
                    name="street"
                    control={control}
                    rules={validationRules.street}
                    render={({ field, fieldState }) => (
                      <TextInput
                        label={t("managedSocialFridge.messages.street") + ": *"}
                        autoFocus={true}
                        field={field}
                        fieldState={fieldState}
                      />
                    )}
                  />
                </Grid>
                <Grid marginTop={2}>
                  <Controller
                    name="buildingNumber"
                    control={control}
                    rules={validationRules.buildingNumber}
                    render={({ field, fieldState }) => (
                      <TextInput
                        label={
                          t("managedSocialFridge.messages.buildingNumber") +
                          ": *"
                        }
                        autoFocus={true}
                        field={field}
                        fieldState={fieldState}
                      />
                    )}
                  />
                </Grid>
                <Grid marginTop={2}>
                  <Controller
                    name="postalCode"
                    control={control}
                    rules={validationRules.postalCode}
                    render={({ field, fieldState }) => (
                      <TextInput
                        label={
                          t("managedSocialFridge.messages.postalCode") + ": *"
                        }
                        autoFocus={true}
                        field={field}
                        fieldState={fieldState}
                      />
                    )}
                  />
                </Grid>
                <Grid marginTop={2}>
                  <Controller
                    name="city"
                    control={control}
                    rules={validationRules.city}
                    render={({ field, fieldState }) => (
                      <TextInput
                        label={t("managedSocialFridge.messages.city") + ": *"}
                        autoFocus={true}
                        field={field}
                        fieldState={fieldState}
                      />
                    )}
                  />
                </Grid>
              </FormControl>
            </Grid>
            <Typography>
              <Grid marginTop={2}>
                <Button
                  startIcon={<FmdGoodRoundedIcon />}
                  variant="contained"
                  onClick={handleMap}
                >
                  {t("managedSocialFridge.messages.chooseLocation")}
                </Button>
              </Grid>
            </Typography>

            <Grid marginTop={2}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSubmit(newFridge)}
                type="submit"
              >
                {t("managedSocialFridge.messages.addFridge")}
              </Button>
            </Grid>
          </form>
        </DialogContent>
      </Dialog>

      <MapDialog
        isOpen={isMapOpened}
        onClose={handleMapOpened}
        userLocation={userLocation}
        latitude={latitude}
        longitude={longitude}
        setValue={setValue}
        handleMapOpened={handleMapOpened}
        buttonLabel={t("map.confirmationDialog.confirm")}
      />
    </>
  );
}
