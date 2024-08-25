import { LatLng } from "leaflet";
import { useMap, useMapEvents } from "react-leaflet";

import { useState } from "react";

interface LocationMarkerProps {
  setCenter: (center: LatLng | undefined) => void;
}

function LocationMarker({ setCenter }: LocationMarkerProps) {
  const map = useMap();

  const [mapCenter, setMapCenter] = useState<LatLng>(map.getCenter());

  useMapEvents({
    move: () => {
      const center = map.getCenter();

      setMapCenter(center);

      setCenter(center);
    },
  });

  return mapCenter && <div></div>;
}

export default LocationMarker;
