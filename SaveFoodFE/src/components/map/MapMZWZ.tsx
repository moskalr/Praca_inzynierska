import FmdGoodRoundedIcon from "@mui/icons-material/FmdGoodRounded";
import { Button, IconButton } from "@mui/material";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import { LatLng, SocialFridge } from "../../type/mzls";
import LocationMarker from "./LocationMarker";
import styles from "./Map.module.css";

const translation = "Tabs.OwnProducts.AddProductStepper.PickupLocationStep.";

interface MapProps {
  userLocation?: LatLng;
  socialFridges?: SocialFridge[];
  specificLatitude?: number;
  specificLongitude?: number;
  productLocation?: LatLng;
  handleSubmitMapChoice?: (mapCenterCoordinates: LatLng | undefined) => void;
  handleMapOpened?: () => void;
  visibleButton: boolean;
}

const locationIcon = new L.Icon({
  iconUrl: "/icons/location.png",

  iconSize: [32, 32],

  iconAnchor: [16, 32],
});

const orderPlace = new L.Icon({
  iconUrl: "/icons/diet.png",

  iconSize: [32, 32],

  iconAnchor: [16, 32],
});

export function Map({
  userLocation,
  socialFridges,
  productLocation,
  specificLatitude,
  specificLongitude,
  handleSubmitMapChoice,
  visibleButton,
}: MapProps) {
  const { t } = useTranslation("foodExchange");
  const [mapCenter, setMapCenter] = useState<LatLng | undefined>();

  const handleConfirmPosition = () => {
    if (handleSubmitMapChoice) handleSubmitMapChoice(mapCenter);
  };

  return (
    <>
      <MapContainer
        className={styles["map-mzwz"]}
        center={
          specificLatitude && specificLongitude
            ? [specificLatitude, specificLongitude]
            : userLocation || [50.754105, 19.456039]
        }
        zoom={18}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {userLocation && (
          <Marker
            position={[userLocation.lat, userLocation.lng]}
            icon={locationIcon}
          ></Marker>
        )}
        {productLocation && (
          <Marker
            position={[productLocation.lat, productLocation.lng]}
            icon={locationIcon}
          />
        )}
        <LocationMarker setCenter={setMapCenter} />

        {specificLatitude && specificLongitude && (
          <Marker
            position={[specificLatitude, specificLongitude]}
            icon={orderPlace}
          >
            <Popup></Popup>
          </Marker>
        )}
        <IconButton
          style={{
            position: "absolute",
            top: "40%",
            left: "46%",
            zIndex: 1700,
          }}
        >
          <FmdGoodRoundedIcon />
        </IconButton>
      </MapContainer>
      {visibleButton && (
        <Button
          sx={{ width: "100%", mt: 1 }}
          onClick={handleConfirmPosition}
          variant="contained"
        >
          {t(translation + "Map.fillAddress")}
        </Button>
      )}
    </>
  );
}

export default Map;
