import ArrowBackIosNewRoundedIcon from "@mui/icons-material/ArrowBackIosNewRounded";
import ArrowForwardIosRoundedIcon from "@mui/icons-material/ArrowForwardIosRounded";
import FmdGoodRoundedIcon from "@mui/icons-material/FmdGoodRounded";
import {
  Button,
  Container,
  Grid,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import styles from "~/styles/event.module.css";
import { eaaDictionary } from "../../../constants/dictionary";
import { LatLng } from "../../../type/mzls";
import { CreateAddressMZWO } from "../../../type/mzwo";
import { createFormattedAddress } from "../../../utils/address/formatAddress";
import { getUserLocation } from "../../../utils/location/location";
import snackbar from "../../../utils/snackbar/snackbar";
import { EaaFormsValidation } from "../../../utils/validation/EaaFormsValidation";

const textFieldVariant = "outlined";

interface CreateAddressProps {
  createdAddress: CreateAddressMZWO;
  handleNext: () => void;
  handleBack: () => void;
  handleCreateAddress: (createdAddress: CreateAddressMZWO) => void;
}

function CreateAddress({
  createdAddress,
  handleNext,
  handleBack,
  handleCreateAddress,
}: CreateAddressProps) {
  const { t } = useTranslation(eaaDictionary);
  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<CreateAddressMZWO>();
  const [userLocation, setUserLocation] = useState<LatLng>();
  const [isNextBlocked, setIsNextBlocked] = useState(true);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [coordinates, setCoordinates] = useState<LatLng>();
  const [mapCenterCoordinates, setMapCenterCoordinates] = useState<
    LatLng | undefined
  >();

  const longitudeFieldRef = useRef<HTMLInputElement | null>(null);
  const latitudeFieldRef = useRef<HTMLInputElement | null>(null);

  const validationRules = EaaFormsValidation(t);

  const DynamicMap = dynamic(() => import("../../../components/map/MapMZWO"), {
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
    setMapCenterCoordinates(mapCenterCoordinates);
    if (mapCenterCoordinates?.lat && mapCenterCoordinates?.lng) {
      const response = await fetch(
        `/api/reverseGeocodeAddress?latitude=${mapCenterCoordinates?.lat}&longitude=${mapCenterCoordinates?.lng}`
      );
      const data = await response.json();
      if (data) {
        const {
          house_number,
          road,
          city,
          postcode,
          municipality,
          village,
          town,
        } = data.address;
        setValue("street", road || village);
        setValue("streetNumber", house_number);
        setValue("postalCode", postcode);
        setValue("city", city || municipality || town);
      }
    }
  };

  const onSubmit = async (data: CreateAddressMZWO) => {
    const address = createFormattedAddress(data);
    const response = await fetch(`/api/geocodeAddress?address=${address}`);
    const location = await response.json();
    if (location.message !== "Coordinates not found") {
      if (longitudeFieldRef.current && latitudeFieldRef.current) {
        longitudeFieldRef.current.value = location.longitude;
        latitudeFieldRef.current.value = location.latitude;
      }

      handleCreateAddress({
        ...createdAddress,
        ...data,
        longitude: location.longitude,
        latitude: location.latitude,
      });
      setCoordinates({
        lat: location.latitude as unknown as number,
        lng: location.longitude as unknown as number,
      });
      setIsNextBlocked(false);
    } else {
      if (location.message == "Coordinates not found") {
        snackbar("snackbar.errorMessage.locationNotFound", "error", t);
      }
    }
  };

  return (
    <Container
      sx={{
        marginTop: "1vh",
        marginBottom: "1vh",
        overflow: "auto",
      }}
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="subtitle2">
              {t("events.stepper.createAddressInfo")}
            </Typography>
          </Grid>
          <Grid item xs={8} sx={{ minHeight: "65vh" }}>
            <div className={styles["tab-map"]}>
              <DynamicMap
                userLocation={userLocation}
                specificLatitude={coordinates?.lat}
                specificLongitude={coordinates?.lng}
                handleSubmitMapChoice={handleSubmitMapChoice}
                isSubmitButtonVisible={true}
                isCenterMarkerVisible={true}
                addressIconUrl="/icons/location.png"
                buttonLabel={t("map.getAddress")}
              />
            </div>
          </Grid>
          <Grid item xs={4}>
            <Stack
              direction="column"
              justifyContent="space-between"
              spacing={2}
            >
              <TextField
                type="text"
                variant={textFieldVariant}
                fullWidth
                defaultValue={createdAddress.street}
                label={t("events.address.street") + " *"}
                {...register("street", { ...validationRules.street })}
                onChange={() => setIsNextBlocked(true)}
                size="small"
                error={!!errors.street}
                helperText={errors.street && errors.street.message}
                InputLabelProps={{
                  shrink: Boolean(createdAddress.street),
                }}
              />
              <TextField
                type="text"
                variant={textFieldVariant}
                fullWidth
                defaultValue={createdAddress.streetNumber}
                {...register("streetNumber", {
                  ...validationRules.streetNumber,
                })}
                onChange={() => setIsNextBlocked(true)}
                size="small"
                label={t("events.address.streetNumber") + " *"}
                error={!!errors.streetNumber}
                helperText={errors.streetNumber && errors.streetNumber.message}
                InputLabelProps={{
                  shrink: Boolean(createdAddress.streetNumber),
                }}
              />

              <TextField
                type="numeric"
                variant={textFieldVariant}
                fullWidth
                defaultValue={createdAddress.postalCode}
                {...register("postalCode", { ...validationRules.postalCode })}
                onChange={() => setIsNextBlocked(true)}
                size="small"
                label={t("events.address.postalCode") + " *"}
                error={!!errors.postalCode}
                helperText={errors.postalCode && errors.postalCode.message}
                InputLabelProps={{
                  shrink: Boolean(createdAddress.postalCode),
                }}
              />
              <TextField
                type="text"
                variant={textFieldVariant}
                fullWidth
                defaultValue={createdAddress.city}
                {...register("city", { ...validationRules.city })}
                onChange={() => setIsNextBlocked(true)}
                size="small"
                label={t("events.address.city") + " *"}
                error={!!errors.city}
                helperText={errors.city && errors.city.message}
                InputLabelProps={{
                  shrink: Boolean(createdAddress.city),
                }}
              />
              <Button
                startIcon={<FmdGoodRoundedIcon />}
                type="submit"
                variant="contained"
                sx={{
                  width: "100%",
                  backgroundColor: "secondary.main",
                  color: "white",
                }}
              >
                {t("events.stepper.showOnMap")}
              </Button>
            </Stack>
          </Grid>
          <Grid
            container
            justifyContent="space-evenly"
            sx={{ marginTop: "1vh" }}
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
                endIcon={<ArrowForwardIosRoundedIcon />}
                onClick={handleNext}
                variant="contained"
                disabled={isNextBlocked}
                sx={{
                  width: "30%",
                  backgroundColor: "secondary.main",
                  color: "white",
                  float: "right",
                }}
              >
                {t("events.stepper.next")}
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </form>
    </Container>
  );
}

export default CreateAddress;
