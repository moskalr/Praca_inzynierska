import {
  Box,
  Card,
  CardContent,
  CardHeader,
  CardMedia,
  Grid,
  Tooltip,
} from "@mui/material";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import EventStepper from "../stepper/EventStepper";
import { eaaDictionary } from "../../../constants/dictionary";
import { userPanelCardColor } from "../../../constants/colors";

interface OrganizeEventCardProps {
  updateEvents: () => void;
}

const OrganizeEventCard = ({ updateEvents }: OrganizeEventCardProps) => {
  const { t } = useTranslation(eaaDictionary);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleFormOpen = () => {
    setIsFormOpen((prev) => !prev);
  };

  return (
    <Grid>
      <Tooltip
        placement="top"
        title={
          <a href="https://storyset.com/event">
            Work illustrations by Storyset
          </a>
        }
      >
        <Card
          sx={{
            marginBottom: 2,
            backgroundColor: userPanelCardColor,
            borderColor: "secondary.main",
            borderRadius: "20px",
            transition: "transform 0.2s",
            "&:hover": {
              transform: "scale(1.02)",
            },
            display: "flex",
          }}
          variant="outlined"
          onClick={handleFormOpen}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              width: "50%",
            }}
          >
            <CardHeader title={t("userPanel.creation.event.organizeEvent")} />
            <CardContent></CardContent>
          </Box>
          <CardMedia
            component="img"
            height="100%"
            image="/icons/Events-bro.png"
            sx={{
              width: "50%",
            }}
          />
        </Card>
      </Tooltip>
      <EventStepper
        open={isFormOpen}
        onClose={handleFormOpen}
        handleFormOpen={handleFormOpen}
        updateEvents={updateEvents}
      />
    </Grid>
  );
};

export default OrganizeEventCard;
