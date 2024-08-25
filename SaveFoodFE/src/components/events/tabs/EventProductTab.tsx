import ImageRoundedIcon from "@mui/icons-material/ImageRounded";
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Container,
  Divider,
  Grid,
  LinearProgress,
  Tooltip,
  Typography,
} from "@mui/material";
import isEmpty from "lodash/isEmpty";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import { accent } from "../../../constants/colors";
import { eaaDictionary } from "../../../constants/dictionary";
import { EventMZWO, ReservationMZWO } from "../../../type/mzwo";
import EventReservation from "../reservation/EventReservation";

interface EventProductTabProps {
  event: EventMZWO;
  responseReservation?: ReservationMZWO;
  reservationTag?: string;
  onReservationUpdate: () => void;
}

function EventProductTab({
  event,
  responseReservation,
  reservationTag,
  onReservationUpdate,
}: EventProductTabProps) {
  const { t } = useTranslation(eaaDictionary);
  const availableFoodPercentage = (
    (event.availableFoodQuantity / event.foodQuantity) *
    100
  ).toFixed(2) as unknown as number;

  const productInfo = [
    { label: t("events.product.name"), value: event.product.productName },
    {
      label: t("events.product.category"),
      value: t(`category.${event.product.category.toLowerCase()}`),
    },
  ];

  const productElements = productInfo.map((info, index) => (
    <Grid item xs={3} key={index}>
      <Typography variant="body2" sx={{ color: "black" }}>
        {info.value}
      </Typography>
      <Typography variant="caption">{info.label}</Typography>
    </Grid>
  ));

  const reservationInfo = [
    {
      label: t("events.reservations.availableFoodQuantity"),
      value: event.availableFoodQuantity,
    },
    {
      label: t("events.reservations.maxReservationQuantity"),
      value: event.maxReservationQuantity,
    },
    {
      label: t("events.reservations.foodQuantity"),
      value: event.foodQuantity,
    },
    {
      label: t("events.reservations.foodUnit"),
      value: t(`units2.${event.foodUnit.toLowerCase()}s`),
    },
  ];

  const reservationElements = reservationInfo.map((info, index) => (
    <Grid item xs={2} key={index}>
      <Typography>{info.value}</Typography>
      <Typography variant="caption">{info.label}</Typography>
    </Grid>
  ));

  return (
    <Container sx={{ height: "75vh", overflowY: "auto" }}>
      <Grid>
        {!isEmpty(event) && (
          <Card>
            <CardHeader
              title={event.title}
              subheader={
                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    {productElements}
                  </Grid>
                  <Grid item xs={6}>
                    {event.product.image ? (
                      <Image
                        src={`${event.product.image}`}
                        alt={event.product.productName}
                        layout="fixed"
                        width={140}
                        height={140}
                        unoptimized
                      />
                    ) : (
                      <Box
                        sx={{
                          width: "100%",
                          height: "100%",
                          overflow: "hidden",
                          backgroundColor: "primary.main",
                        }}
                      >
                        <ImageRoundedIcon sx={{ height: 140, width: "100%" }} />
                      </Box>
                    )}
                  </Grid>
                </Grid>
              }
              sx={{ color: "secondary.main" }}
            />
            <Divider>
              <Typography color="text.secondary" variant="caption">
                {t("events.tabs.reservation")}
              </Typography>
            </Divider>
            <CardContent>
              <Grid container spacing={1} sx={{ overflow: "auto" }}>
                {reservationElements}
              </Grid>
              <Grid sx={{ marginTop: "3vh" }} xs={8}>
                <Tooltip title={availableFoodPercentage + "%"}>
                  <LinearProgress
                    variant="determinate"
                    value={availableFoodPercentage}
                    sx={{
                      height: "2vh",
                      backgroundImage: `linear-gradient(to right, ${accent} ${availableFoodPercentage}%, transparent ${availableFoodPercentage}%)`,
                      border: "solid 1px",
                      borderColor: "primary.main",
                    }}
                  />
                </Tooltip>
              </Grid>
            </CardContent>
            <CardContent>
              {event.isParticipant && (
                <Typography>
                  <Divider>
                    <Typography color="text.secondary" variant="caption">
                      {t("events.reservations.my")}
                    </Typography>
                  </Divider>
                  {!isEmpty(event) && (
                    <EventReservation
                      maxReservationQuantity={event.maxReservationQuantity}
                      responseReservation={responseReservation}
                      reservationTag={reservationTag}
                      onReservationUpdate={onReservationUpdate}
                    />
                  )}
                </Typography>
              )}
            </CardContent>
          </Card>
        )}
        {isEmpty(event) && (
          <Box>
            <Typography>{t("events.error.notFound")}</Typography>
          </Box>
        )}
      </Grid>
    </Container>
  );
}

export default EventProductTab;
