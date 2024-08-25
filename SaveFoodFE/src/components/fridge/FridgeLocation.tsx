import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import L from "leaflet";
import { useRouter } from "next/router";
import { Marker, Popup } from "react-leaflet";
import { SocialFridge } from "../../type/mzls";
import RatingDisplay from "./RatingDisplay";
import styles from "./product.module.css";

interface FridgeLocationProps {
  fridges: SocialFridge[];
  mapLabel: string | undefined;
}

const kitchenIcon = new L.Icon({
  iconUrl: "/icons/fridge.png",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

const FridgeLocation = ({ fridges, mapLabel }: FridgeLocationProps) => {
  const router = useRouter();

  return (
    <>
      {fridges.map((fridge) => (
        <Marker
          key={fridge.id}
          position={[
            Number(fridge.address.latitude),
            Number(fridge.address.longitude),
          ]}
          icon={kitchenIcon}
        >
          <Popup>
            <div>
              <h2>
                {fridge.address.street} {fridge.address.buildingNumber}
              </h2>
              <p>
                {fridge.address.city}, {fridge.address.postalCode}
              </p>
              <div className={styles.container}>
                <p>
                  {mapLabel}
                  {fridge.socialFridgeAverageRating.averageRating}
                </p>
                <RatingDisplay
                  rating={fridge.socialFridgeAverageRating.averageRating || 0}
                />
                <div
                  onClick={() => {
                    router.push(`/fridge/${fridge.id}`);
                  }}
                  className={styles.icon}
                >
                  <ExitToAppIcon fontSize="large" />
                </div>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </>
  );
};

export default FridgeLocation;
