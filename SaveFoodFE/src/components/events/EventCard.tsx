import FmdGoodRoundedIcon from "@mui/icons-material/FmdGoodRounded";
import ImageRoundedIcon from "@mui/icons-material/ImageRounded";
import {
  Avatar,
  Box,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  CardMedia,
  Grid,
  Link,
  Typography,
} from "@mui/material";
import { accent } from "../../constants/colors";
import { EventMZWO } from "../../type/mzwo";
import { formatDate, formatTime } from "../../utils/date/date";

interface EventCardProps {
  event: EventMZWO;
  t: (key: string) => string;
}

const EventCard = ({ event, t }: EventCardProps) => {
  return (
    <Grid item xs={12} sm={6} md={4} key={event.id}>
      <Card
        sx={{
          backgroundColor: "white",
          borderRadius: "20px",
          transform: "scale(1)",
          transition: "transform 0.2s",
          "&:hover": {
            transform: "scale(1.03)",
          },
          borderColor: accent,
        }}
        variant="outlined"
      >
        {event.product.image ? (
          <Box sx={{ width: "100%", height: "25%", overflow: "hidden" }}>
            <CardMedia
              component="img"
              height="140"
              image={`data:image/jpg;base64,${event.product.image}`}
            />
          </Box>
        ) : (
          <Box
            sx={{
              width: "100%",
              height: "25%",
              overflow: "hidden",
              backgroundColor: "primary.main",
            }}
          >
            <ImageRoundedIcon sx={{ height: 140, width: "100%" }} />
          </Box>
        )}
        <CardHeader
          title={event.title}
          subheader={
            <Typography>
              <div>{formatDate(event.startDate)}</div>
              <div>{formatTime(event.startDate)}</div>
            </Typography>
          }
          sx={{ color: "secondary.main" }}
        />
        <CardContent>
          <Box display="flex" alignItems="center">
            <Avatar sx={{ backgroundColor: "error.main", marginRight: 1 }}>
              <FmdGoodRoundedIcon fontSize="small" />
            </Avatar>
            <div>
              <Typography variant="body2" sx={{ color: "secondary.main" }}>
                {event.location.street}, {event.location.streetNumber}
              </Typography>
              <Typography variant="body2" sx={{ color: "secondary.main" }}>
                {event.location.postalCode} {event.location.city}
              </Typography>
            </div>
          </Box>
        </CardContent>
        <CardActions>
          <Link
            sx={{ color: "secondary.main" }}
            href={`/events-announcements/events/${event.id}`}
          >
            <a>&gt; {t("events.cards.details")}</a>
          </Link>
        </CardActions>
      </Card>
    </Grid>
  );
};

export default EventCard;
