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
import { HTTP_PATCH, HTTP_PUT } from "../../constants/httpMethods";
import { Account, Address, LatLng, SocialFridge } from "../../type/mzls";
import { fetchAndSetCoordinates } from "../../utils/address/findAddress";
import { createFormattedAddress } from "../../utils/address/formatAddress";
import fetchWithAuthorization from "../../utils/axios/fetchWrapper";
import snackbar from "../../utils/snackbar/snackbar";
import capitalizeFirstLetter from "../../utils/string/capitalizeFirstLetter";
import { AddProductFormValidation } from "../../utils/validation/MzlsFormsValidation";
import MapDialog from "./DialogMap";
import SelectManagerInput from "./useFormInput/SelectManagerInput";
import TextInput from "./useFormInput/TextInput";

interface EditFridgeProps {
  isOpen: boolean;
  onClose: () => void;
  t: Function;
  userLocation?: LatLng;
  managers: Account[];
  socialFridge: SocialFridge;
  socialFridgeETag?: string;
  addressETag?: string;
  handleEditManager: (newManager: Account) => void;
  handleEditAddress: (newAddress: Address) => void;
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

export default function EditFridge({
  isOpen,
  onClose,
  t,
  userLocation,
  managers,
  socialFridge,
  socialFridgeETag,
  addressETag,
  handleEditManager,
  handleEditAddress,
}: EditFridgeProps) {
  const validationRules = AddProductFormValidation(t);
  const defaultValues: TFormValues = {
    username: socialFridge.account.username,
    street: socialFridge.address.street,
    buildingNumber: socialFridge.address?.buildingNumber,
    city: socialFridge.address.city,
    postalCode: socialFridge.address.postalCode,
    latitude: null,
    longitude: null,
  };

  const [isMapOpened, setIsMapOpened] = useState(false);
  const { handleSubmit, control, watch, setValue, reset } = useForm({
    defaultValues: defaultValues,
  });
  const { latitude, longitude } = watch();

  const editFridge = () => {
    const { street, buildingNumber, city, postalCode, username } = watch();

    if (socialFridge.account.username !== username) {
      editManager();
    }
    if (
      socialFridge.address.street !== street ||
      socialFridge.address.buildingNumber !== buildingNumber ||
      socialFridge.address.city !== city ||
      socialFridge.address.postalCode !== postalCode
    ) {
      editAddress();
    }
    onClose();
  };

  const editAddress = async () => {
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
        const id = socialFridge.address.id;

        const { latitude, longitude } = watch();

        const putData = {
          id,
          street: capitalizedStreet,
          buildingNumber,
          city: capitalizedCity,
          postalCode,
          latitude,
          longitude,
        };

        const requestOptions = {
          body: JSON.stringify({
            putData: putData,
          }),
          headers: {
            "If-Match": addressETag,
          },
        };

        await fetchWithAuthorization(
          `/api/social-fridge/addresses`,
          HTTP_PUT,
          requestOptions
        )
          .then((response) => {
            if (response.status === HTTP_UNAUTHORIZED) {
              snackbar("errors.unauthorized", "error", t);
              router.push("/login");
            }
            return response.json().then((data) => {
              if (response.ok) {
                snackbar(
                  "fridge.successes.editFridgeAddressSuccess",
                  "success",
                  t
                );
                handleEditAddress(data.address);
                onClose();
              } else if (data.error.key !== undefined) {
                snackbar(`errors.${data.error.key}`, "error", t);
              }
            });
          })
          .catch(() => {
            snackbar("errors.editFridgeAddressError", "error", t);
          });
      } else {
        if (location.message == "Coordinates not found") {
          snackbar("errors.locationNotFoundError", "error", t);
        }
      }
    }
  };

  const editManager = async () => {
    const { username } = watch();

    const requestOptions = {
      body: JSON.stringify({
        value: username,
        path: "/username",
      }),
      headers: {
        "If-Match": socialFridgeETag,
      },
    };

    await fetchWithAuthorization(
      `/api/social-fridge/fridge/${socialFridge?.id}`,
      HTTP_PATCH,
      requestOptions
    )
      .then((response) => {
        if (response.status === HTTP_UNAUTHORIZED) {
          snackbar("errors.unauthorized", "error", t);
          router.push("/login");
        }
        return response.json().then((data) => {
          if (response.ok) {
            snackbar("fridge.successes.editFridgeManagerSuccess", "success", t);
            handleEditManager(data.fridge.account);
            onClose();
          } else if (data.error.key !== undefined) {
            snackbar(`errors.${data.error.key}`, "error", t);
          }
        });
      })
      .catch(() => {
        snackbar("errors.editFridgeManagerError", "error", t);
      });
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
        className={styles["edit-fridge"]}
      >
        <DialogTitle>{t("fridge.messages.edit_fridge_title")}</DialogTitle>
        <DialogContent>
          <form onSubmit={editFridge}>
            <Grid marginTop={2}>
              <FormControl
                style={{ width: "100%" }}
                variant="outlined"
                size="small"
              >
                <InputLabel htmlFor="username">
                  {t("fridge.messages.manager")}
                </InputLabel>
                <Controller
                  name="username"
                  control={control}
                  rules={validationRules.manager}
                  render={({ field, fieldState }) => (
                    <SelectManagerInput
                      defaultValue={socialFridge.account.username}
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
                        defaultValue={socialFridge.address.street}
                        label={t("fridge.messages.street")}
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
                        defaultValue={socialFridge.address.buildingNumber}
                        label={t("fridge.messages.buildingNumber")}
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
                        defaultValue={socialFridge.address.postalCode}
                        label={t("fridge.messages.postalCode")}
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
                        defaultValue={socialFridge.address.city}
                        label={t("fridge.messages.city")}
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
                  style={{ color: secondary }}
                  onClick={handleMap}
                >
                  {t("fridge.messages.chooseLocation")}
                </Button>
              </Grid>
            </Typography>

            <Grid marginTop={2}>
              <Button
                variant="contained"
                style={{ color: secondary }}
                onClick={handleSubmit(editFridge)}
                type="submit"
              >
                {t("fridge.messages.edit_fridge_title")}
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
        buttonLabel={t("confirmationDialog.confirm")}
      />
    </>
  );
}
