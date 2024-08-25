import {
  Box,
  Card,
  CardContent,
  CardHeader,
  CardMedia,
  Dialog,
  DialogTitle,
  Grid,
  IconButton,
  Tooltip,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import CloseIcon from "@mui/icons-material/Close";
import { eaaDictionary } from "../../../constants/dictionary";
import { userPanelCardColor } from "../../../constants/colors";
import CreateAnnouncementForm from "../../announcements/form/CreateAnnouncementForm";

const PublishAnnouncement = () => {
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
          <a href="https://storyset.com/work">Work illustrations by Storyset</a>
        }
      >
        <Card
          sx={{
            marginBottom: 2,
            backgroundColor: userPanelCardColor,
            borderRadius: "20px",
            borderColor: "secondary.main",
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
            <CardHeader
              title={t("userPanel.creation.announcement.createAnnouncement")}
            />
            <CardContent></CardContent>
          </Box>
          <CardMedia
            component="img"
            height="100%"
            image="/icons/Notes-bro.png"
            sx={{
              width: "50%",
            }}
          />
        </Card>
      </Tooltip>
      <Dialog open={isFormOpen}>
        <DialogTitle>
          <Grid container xs={12}>
            <Grid item xs={10}>
              <Typography variant="h6" color="secondary.main">
                {t("announcements.form.create.create")}
              </Typography>
            </Grid>
            <Grid item xs={2} justifyContent="flex-end">
              <Tooltip
                title={t("announcements.form.create.cancel")}
                placement="top"
              >
                <IconButton onClick={handleFormOpen}>
                  <CloseIcon />
                </IconButton>
              </Tooltip>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" color="red">
                {t("events.stepper.required")}
              </Typography>
            </Grid>
          </Grid>
        </DialogTitle>
        <CreateAnnouncementForm
          handleFormOpen={handleFormOpen}
          updateAnnouncements={function (): void {
            throw new Error("Function not implemented.");
          }}
        />
      </Dialog>
    </Grid>
  );
};

export default PublishAnnouncement;
