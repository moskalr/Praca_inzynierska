import L from "leaflet";

import "leaflet/dist/leaflet.css";

import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";

import { LatLng, SocialFridge } from "../../type/mzls";

import styles from "./Map.module.css";

import { useState } from "react";

import { Button, IconButton } from "@mui/material";

import FmdGoodRoundedIcon from "@mui/icons-material/FmdGoodRounded";
import LocationMarker from "./LocationMarker";

interface MapProps {
  userLocation?: LatLng;

  socialFridges?: SocialFridge[];

  specificLatitude?: number;

  specificLongitude?: number;

  addressIconUrl?: string;

  handleSubmitMapChoice?: (mapCenterCoordinates: LatLng | undefined) => void;

  isSubmitButtonVisible?: boolean;
  isCenterMarkerVisible?: boolean;
  buttonLabel?: string;
}

const locationIcon = new L.Icon({
  iconUrl: "/icons/location.png",

  iconSize: [32, 32],

  iconAnchor: [16, 32],
});

export function Map({
  userLocation,

  socialFridges,

  specificLatitude,

  specificLongitude,

  addressIconUrl,

  handleSubmitMapChoice,

  isSubmitButtonVisible,
  isCenterMarkerVisible,
  buttonLabel,
}: MapProps) {
  const [mapCenter, setMapCenter] = useState<LatLng | undefined>();

  const handleConfirmPosition = () => {
    if (handleSubmitMapChoice) {
      handleSubmitMapChoice(mapCenter);
    }
  };

  const addressIcon = new L.Icon({
    iconUrl: addressIconUrl,

    iconSize: [32, 32],

    iconAnchor: [16, 32],
  });

  const eventIcon = new L.Icon({
    iconUrl: "/icons/event.png",

    iconSize: [32, 32],

    iconAnchor: [16, 32],
  });

  return (
    <>
      <MapContainer
        className={styles["map-mzwo"]}
        center={
          specificLatitude && specificLongitude
            ? [specificLatitude, specificLongitude]
            : userLocation || [51.754105, 19.456039]
        }
        zoom={10}
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
          >
            <Popup></Popup>
          </Marker>
        )}

        <LocationMarker setCenter={setMapCenter} />

        {specificLatitude && specificLongitude && (
          <Marker
            position={[specificLatitude, specificLongitude]}
            icon={eventIcon}
          >
            <Popup></Popup>
          </Marker>
        )}
        {isCenterMarkerVisible && (
          <IconButton
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              zIndex: 999,
            }}
          >
            <FmdGoodRoundedIcon />
          </IconButton>
        )}
      </MapContainer>
      {isSubmitButtonVisible && (
        <Button
          className={styles["button-mzwo"]}
          onClick={handleConfirmPosition}
          variant="contained"
          sx={{ backgroundColor: "secondary.main", color: "white" }}
        >
          {buttonLabel}
        </Button>
      )}
    </>
  );
}

export default Map;
