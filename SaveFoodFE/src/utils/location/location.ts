import { LatLng } from "../../type/mzls";
import snackbar from "../snackbar/snackbar";

export const getUserLocation = (t: Function) => {
  return new Promise<LatLng>((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        resolve({ lat: latitude, lng: longitude });
      },
      (error) => {
        snackbar("errors.location_error", "error", t);
      }
    );
  });
};
