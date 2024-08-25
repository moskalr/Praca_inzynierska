import L from "leaflet";

import "leaflet/dist/leaflet.css";

import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";

import { LatLng, SocialFridge } from "../../type/mzls";

import FridgeLocation from "../fridge/FridgeLocation";

import styles from "./Map.module.css";

import { useState } from "react";

import { Button } from "@mui/material";

import { useTranslation } from "react-i18next";

import { mapDictionary } from "../../constants/dictionary";

import { secondary } from "../../constants/colors";
import { EventMZWO } from "../../type/mzwo";
import { Product } from "../../type/mzwz";
import LocationMarker from "./LocationMarker";

interface MapProps {
  userLocation?: LatLng;

  socialFridges?: SocialFridge[];

  products?: Product[];

  events?: EventMZWO[];

  specificLatitude?: number | null;

  specificLongitude?: number | null;

  addressIconUrl?: string;

  handleSubmitMapChoice?: (mapCenterCoordinates: LatLng | undefined) => void;

  handleMapOpened?: () => void;

  isSubmitButtonVisible?: boolean;

  buttonLabel?: string;

  mapLabel?: string;
}

const locationIcon = new L.Icon({
  iconUrl: "/icons/location.png",

  iconSize: [32, 32],

  iconAnchor: [16, 32],
});

export function Map({
  userLocation,

  socialFridges,

  products,

  events,

  specificLatitude,

  specificLongitude,

  addressIconUrl,

  handleSubmitMapChoice,

  handleMapOpened,

  isSubmitButtonVisible,

  buttonLabel,

  mapLabel,
}: MapProps) {
  const { t } = useTranslation(mapDictionary);

  const [mapCenter, setMapCenter] = useState<LatLng | undefined>();

  const handleConfirmPosition = () => {
    if (handleSubmitMapChoice && handleMapOpened) {
      handleSubmitMapChoice(mapCenter);
      handleMapOpened();
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

  const productIcon = new L.Icon({
    iconUrl: "/icons/diet.png",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
  });

  return (
    <>
      <MapContainer
        className={styles["map"]}
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

        {socialFridges && (
          <FridgeLocation fridges={socialFridges} mapLabel={mapLabel} />
        )}

        {events &&
          events.map((event) => (
            <Marker
              position={[
                Number(event.location.latitude),
                Number(event.location.longitude),
              ]}
              icon={eventIcon}
            >
              <Popup></Popup>
            </Marker>
          ))}

        {products &&
          products.map((product) => (
            <Marker
              position={[
                Number(product.mapAddress.latitude),
                Number(product.mapAddress.longitude),
              ]}
              icon={productIcon}
            ></Marker>
          ))}

        {specificLatitude && specificLongitude && (
          <Marker
            position={[specificLatitude, specificLongitude]}
            icon={addressIcon}
          >
            <Popup></Popup>
          </Marker>
        )}

        {isSubmitButtonVisible && (
          <Button
            className={styles["button"]}
            onClick={handleConfirmPosition}
            style={{ color: secondary }}
            variant="contained"
          >
            {buttonLabel}
          </Button>
        )}
      </MapContainer>
    </>
  );
}

export default Map;
