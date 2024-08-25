import {
  Box,
  Button,
  Grid,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { foodExchangeDictionary } from "../../../constants/dictionary";
import { LatLng } from "../../../type/mzls";
import { CreateMapAddressType } from "../../../type/mzwz";
import { createFormattedAddress } from "../../../utils/address/formatAddress";
import { getUserLocation } from "../../../utils/location/location";
import snackbarTranslated from "../../../utils/snackbar/snackbarTranslated";
import { FormValidationList } from "../formValidation/FormValidationList";

const textFieldVariant = "outlined";
const translation = "Tabs.OwnProducts.AddProductStepper.PickupLocationStep.";

interface CreateMapAddressProps {
  createdMapAddress: CreateMapAddressType;
  handleCreate: () => void;
  handleBack: () => void;
  handleUpdateMapAddressProduct: (
    update: Partial<CreateMapAddressType>
  ) => void;
}

function AddLocationProduct({
  createdMapAddress,
  handleCreate,
  handleBack,
  handleUpdateMapAddressProduct,
}: CreateMapAddressProps) {
  const { t } = useTranslation(foodExchangeDictionary);
  const {
    register,
    handleSubmit,
    formState,
    setValue,
    setError,
    getValues,
    watch,
  } = useForm<CreateMapAddressType>();
  const [isMapOpened, setIsMapOpened] = useState(false);
  const [userLocation, setUserLocation] = useState<LatLng>();
  const theme = useTheme();
  const [mapCenterCoordinates, setMapCenterCoordinates] = useState<
    LatLng | undefined
  >();
  const [checkMap, setCheckMap] = useState(false);
  const longitudeFieldRef = useRef<HTMLInputElement | null>(null);
  const latitudeFieldRef = useRef<HTMLInputElement | null>(null);
  const validationRules = FormValidationList(t);
  const [isFinishBlocked, setIsFinishBlocked] = useState(true);

  const DynamicMap = dynamic(() => import("../../../components/map/MapMZWZ"), {
    ssr: false,
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      getUserLocation(t).then((location) => {
        setUserLocation(location);
      });
    }
  }, []);

  const handleSubmitMapChoice = async (
    mapCenterCoordinates: LatLng | undefined
  ) => {
    if (mapCenterCoordinates?.lat && mapCenterCoordinates?.lng) {
      setMapCenterCoordinates(mapCenterCoordinates);

      const response = await fetch(
        `/api/reverseGeocodeAddress?latitude=${mapCenterCoordinates?.lat}&longitude=${mapCenterCoordinates?.lng}`
      );
      const data = await response.json();

      if (data && data.address) {
        const {
          house_number,
          road,
          city,
          postcode,
          municipality,
          village,
          town,
        } = data.address;
        setValue("street", road || village, { shouldValidate: true });

        setValue("streetNumber", house_number, { shouldValidate: true });
        setValue("postalCode", postcode, { shouldValidate: true });
        setValue("city", city || municipality || town, {
          shouldValidate: true,
        });
        !data.address.house_number || !data.address.postcode
          ? setCheckMap(false)
          : setCheckMap(true);
      }

      handleUpdateMapAddressProduct({
        ...createdMapAddress,
        ...getValues(),
        longitude: mapCenterCoordinates.lng,
        latitude: mapCenterCoordinates.lat,
      });
    }
  };

  const handleMapOpened = () => {
    setIsMapOpened((prev) => !prev);
  };

  const onSubmit = async (data: CreateMapAddressType) => {
    const address = createFormattedAddress(data);
    const response = await fetch(`/api/geocodeAddress?address=${address}`);
    const location = await response.json();

    if (
      location &&
      location.longitude !== undefined &&
      location.latitude !== undefined
    ) {
      if (longitudeFieldRef.current && latitudeFieldRef.current) {
        longitudeFieldRef.current.value = location.longitude;
        latitudeFieldRef.current.value = location.latitude;
      }

      handleUpdateMapAddressProduct({
        ...createdMapAddress,
        ...data,
        longitude: location.longitude,
        latitude: location.latitude,
      });

      setMapCenterCoordinates({
        lat: location.latitude as unknown as number,
        lng: location.longitude as unknown as number,
      });
      setCheckMap(true);
    } else {
      if (
        data.street !== "" ||
        data.streetNumber !== "" ||
        data.city !== "" ||
        data.street !== "" ||
        data.postalCode !== ""
      ) {
        snackbarTranslated(t(translation + "Map.Address.error"), "error");
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={1} columns={{ xs: 8, sm: 8, md: 12 }}>
        <Grid item xs={8}>
          <Box>
            <DynamicMap
              userLocation={userLocation}
              specificLatitude={mapCenterCoordinates?.lat}
              specificLongitude={mapCenterCoordinates?.lng}
              handleSubmitMapChoice={handleSubmitMapChoice}
              handleMapOpened={handleMapOpened}
              visibleButton={true}
            />
          </Box>
        </Grid>
        <Grid container item xs={4}>
          <Grid item xs={12}>
            <Typography sx={{ m: 0.5 }}>
              {t(translation + "Address.title")}
              <TextField
                sx={{ mt: 1, width: "100%" }}
                type="text"
                variant={textFieldVariant}
                label={t(translation + "Address.street")}
                {...register("street", {
                  ...validationRules.street,
                })}
                onChange={() => setCheckMap(false)}
                error={!!formState.errors.street}
                helperText={formState.errors.street?.message}
                size="small"
                defaultValue={createdMapAddress.street}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Typography>
            <Typography sx={{ m: 0.5 }}>
              <TextField
                sx={{ width: "100%" }}
                type="text"
                variant={textFieldVariant}
                {...register("streetNumber", {
                  ...validationRules.streetNumber,
                })}
                error={!!formState.errors.streetNumber}
                helperText={formState.errors.streetNumber?.message}
                size="small"
                label={t(translation + "Address.number")}
                onChange={() => setCheckMap(false)}
                defaultValue={createdMapAddress.streetNumber}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Typography>

            <Typography sx={{ m: 0.5 }}>
              <TextField
                sx={{ width: "100%" }}
                type="numeric"
                variant={textFieldVariant}
                {...register("postalCode", {
                  ...validationRules.postalCode,
                })}
                error={!!formState.errors.postalCode}
                helperText={formState.errors.postalCode?.message}
                size="small"
                label={t(translation + "Address.postalCode")}
                defaultValue={createdMapAddress.postalCode}
                onChange={() => {
                  setCheckMap(false);
                }}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Typography>
            <Typography sx={{ m: 0.5 }}>
              <TextField
                sx={{ width: "100%" }}
                type="text"
                variant={textFieldVariant}
                size="small"
                {...register("city", {
                  ...validationRules.city,
                })}
                error={!!formState.errors.city}
                helperText={formState.errors.city?.message}
                label={t(translation + "Address.city")}
                defaultValue={createdMapAddress.city}
                onChange={() => setCheckMap(false)}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Typography>
            <Typography sx={{ m: 0.5 }}>
              <Button type="submit" variant="contained" fullWidth>
                {t(translation + "seeAddressOnMap")}
              </Button>
            </Typography>
          </Grid>
        </Grid>
        <Grid item xs={12}>
          <Box m={0.5} textAlign="right">
            <Button
              sx={{ mr: 1 }}
              onClick={handleBack}
              variant="contained"
              color="primary"
            >
              {t(translation + "back")}
            </Button>
            <Button
              type="submit"
              onClick={handleCreate}
              variant="contained"
              color="primary"
              disabled={!checkMap}
            >
              {t(translation + "finish")}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </form>
  );
}

export default AddLocationProduct;
