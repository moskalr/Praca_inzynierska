import { LatLng } from "../../type/mzls";
import snackbar from "../snackbar/snackbar";
import { createFormattedAddress } from "./formatAddress";

export const fetchAndSetCoordinates = async (
  watch: Function,
  setValue: Function,
  t: Function
) => {
  const { street, buildingNumber, city, postalCode } = watch();
  const address = createFormattedAddress({
    street,
    streetNumber: buildingNumber,
    city,
    postalCode,
    latitude: "",
    longitude: "",
  });

  const response = await fetch(`/api/geocodeAddress?address=${address}`);
  const location = await response.json();

  if (location) {
    setValue("longitude", location.longitude);
    setValue("latitude", location.latitude);
  } else {
    if (
      street !== "" ||
      buildingNumber !== "" ||
      city !== "" ||
      postalCode !== ""
    ) {
      snackbar("errors.locationNotFoundError", "error", t);
    }
  }
};

export const handleMapChoiceAndSetAddress = async (
  mapCenterCoordinates: LatLng | undefined,
  setValue: Function
) => {
  if (mapCenterCoordinates?.lat && mapCenterCoordinates?.lng) {
    const response = await fetch(
      `/api/reverseGeocodeAddress?latitude=${mapCenterCoordinates?.lat}&longitude=${mapCenterCoordinates?.lng}`
    );
    const mapLocation = await response.json();

    if (mapLocation) {
      const {
        house_number,
        road,
        city,
        postcode,
        municipality,
        village,
        town,
      } = mapLocation.address;
      setValue("street", road || village);
      setValue("buildingNumber", house_number);
      setValue("postalCode", postcode);
      setValue("city", city || municipality || town);
    }
  }
};
