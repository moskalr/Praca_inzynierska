import {
  Card,
  CardContent,
  CardHeader,
  Container,
  Divider,
  Grid,
  Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import styles from "~/styles/event.module.css";
import dynamic from "next/dynamic";
import { SetStateAction, useEffect, useState } from "react";
import { EventMZWO } from "../../../type/mzwo";
import { eaaDictionary } from "../../../constants/dictionary";
import { LatLng } from "../../../type/mzls";
import { getUserLocation } from "../../../utils/location/location";

interface EventLocationTabProps {
  event: EventMZWO;
}

function EventLocationTab({ event }: EventLocationTabProps) {
  const { t } = useTranslation(eaaDictionary);
  const [userLocation, setUserLocation] = useState<LatLng>();
  const [coordinates, setCoordinates] = useState<LatLng>({
    lat: event.location.latitude as unknown as number,
    lng: event.location.longitude as unknown as number,
  });

  const addressInfo = [
    { label: t("events.address.street"), value: event.location.street },
    {
      label: t("events.address.streetNumber"),
      value: event.location.streetNumber,
    },
    { label: t("events.address.postalCode"), value: event.location.postalCode },
    { label: t("events.address.city"), value: event.location.city },
  ];

  const addressElements = addressInfo.map((info, index) => (
    <Grid item xs={3} key={index}>
      <Typography>{info.value}</Typography>
      <Typography variant="caption">{info.label}</Typography>
    </Grid>
  ));

  const DynamicMap = dynamic(() => import("../../map/MapMZWO"), {
    ssr: false,
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      getUserLocation(t).then(
        (location: SetStateAction<LatLng | undefined>) => {
          setUserLocation(location);
        }
      );
    }
  }, []);

  return (
    <Container sx={{ height: "75vh", overflowY: "auto" }}>
      <Card variant="outlined">
        <CardHeader
          title={event.title}
          subheader={
            <Grid container spacing={1}>
              {addressElements}
            </Grid>
          }
          sx={{ color: "secondary.main" }}
        />
        <Divider />
        <CardContent sx={{ height: "50vh" }}>
          <div className={styles["tab-map"]}>
            <DynamicMap
              userLocation={userLocation}
              specificLatitude={coordinates.lat}
              specificLongitude={coordinates.lng}
              isSubmitButtonVisible={false}
              addressIconUrl="/icons/location.png"
            />
          </div>
        </CardContent>
      </Card>
    </Container>
  );
}

export default EventLocationTab;
