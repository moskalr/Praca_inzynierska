import ExpandLessRoundedIcon from "@mui/icons-material/ExpandLessRounded";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardActions,
  CardHeader,
  Collapse,
  Divider,
  Grid,
  Link,
  List,
  ListItem,
  Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { accent } from "../../../constants/colors";
import { eaaDictionary } from "../../../constants/dictionary";
import { AnnouncementMZWO, EventMZWO } from "../../../type/mzwo";
import {
  formatDate,
  formatDateToDisplay,
  formatTime,
} from "../../../utils/date/date";

interface ModeratorSectionProps {
  pendingEvents: EventMZWO[];
  reportedAnnouncements: AnnouncementMZWO[];
  handleExpandModeratorClick: () => void;
  moderatorExpanded: boolean;
}

function ModeratorSection({
  pendingEvents,
  reportedAnnouncements,
  handleExpandModeratorClick,
  moderatorExpanded,
}: ModeratorSectionProps) {
  const { t } = useTranslation(eaaDictionary);
  return (
    <Grid
      item
      xs={11}
      sx={{
        backgroundColor: "primary.main",
        borderRadius: "20px",
        display: "flex",
        textAlign: "center",
      }}
      direction="column"
      marginBottom="2vh"
    >
      <Grid container item xs={11} sx={{ marginBottom: "1vh" }}>
        <Grid item xs={6}>
          <Divider textAlign="center" flexItem>
            <Typography>{t("userPanel.moderator.pendingEvents")}</Typography>
          </Divider>
        </Grid>
        <Grid item xs={6}>
          <Divider textAlign="center" flexItem>
            <Typography>
              {t("userPanel.moderator.reportedAnnouncements")}
            </Typography>
          </Divider>
        </Grid>
      </Grid>
      <Grid container item xs={12}>
        <Collapse
          sx={{
            width: "100%",
            justifyContent: "center",
            alignContent: "center",
          }}
          in={moderatorExpanded}
          timeout={1000}
        >
          <Grid container item xs={12}>
            <Grid
              item
              xs={6}
              sx={{
                backgroundColor: "primary.main",
                borderRadius: "20px",
                overflowX: "auto",
                marginTop: "2vh",
                maxHeight: "70vh",
                "&::-webkit-scrollbar": {
                  width: "5px",
                },
                "&::-webkit-scrollbar-thumb": {
                  backgroundColor: "secondary.main",
                  borderRadius: "10px",
                },
              }}
            >
              {pendingEvents.length === 0 && (
                <Typography>{t("userPanel.events.emptyPending")}</Typography>
              )}
              {pendingEvents.length !== 0 && (
                <List>
                  {pendingEvents.map((event) => (
                    <ListItem>
                      <Card
                        sx={{
                          borderRadius: "20px",
                          width: "90%",
                          transition: "transform 0.2s",
                          "&:hover": {
                            transform: "scale(1.02)",
                          },
                          borderColor: "secondary.main",
                        }}
                        variant="outlined"
                      >
                        <CardActions>
                          <Link
                            sx={{ color: "secondary.main" }}
                            href={`/events-announcements/events/${event.id}`}
                          >
                            <CardHeader
                              title={
                                <span style={{ fontSize: "19px" }}>
                                  {event.title}
                                </span>
                              }
                              subheader={
                                <>
                                  <p>
                                    {formatDate(event.startDate)}{" "}
                                    {formatTime(event.startDate)}
                                  </p>
                                  <p>
                                    {event.location.street}{" "}
                                    {event.location.streetNumber}
                                  </p>
                                </>
                              }
                            />
                          </Link>
                        </CardActions>
                      </Card>
                    </ListItem>
                  ))}
                </List>
              )}
            </Grid>
            <Grid
              item
              xs={6}
              sx={{
                backgroundColor: "primary.main",
                borderRadius: "20px",
                overflowX: "auto",
                marginTop: "2vh",
                maxHeight: "70vh",
                "&::-webkit-scrollbar": {
                  width: "5px",
                },
                "&::-webkit-scrollbar-thumb": {
                  backgroundColor: "secondary.main",
                  borderRadius: "10px",
                },
              }}
            >
              {reportedAnnouncements.length === 0 && (
                <Typography>
                  {t("userPanel.announcements.emptyReported")}
                </Typography>
              )}
              {reportedAnnouncements.length !== 0 && (
                <List>
                  {reportedAnnouncements.map((announcement) => (
                    <ListItem>
                      <Card
                        sx={{
                          borderRadius: "20px",
                          width: "90%",
                          transition: "transform 0.2s",
                          "&:hover": {
                            transform: "scale(1.02)",
                          },
                          borderColor: "secondary.main",
                        }}
                        variant="outlined"
                      >
                        <CardActions>
                          <Link
                            sx={{ color: "secondary.main" }}
                            href={`/events-announcements/announcements`}
                          >
                            <CardHeader
                              title={
                                <span style={{ fontSize: "19px" }}>
                                  {announcement.title}
                                </span>
                              }
                              subheader={
                                <Grid
                                  container
                                  justifyContent="space-between"
                                  xs={12}
                                >
                                  <Grid item xs={11}>
                                    <Box
                                      display="flex"
                                      justifyContent="flex-start"
                                      alignItems="center"
                                    >
                                      <Avatar
                                        sx={{
                                          backgroundColor: "secondary.main",
                                        }}
                                      >
                                        {announcement.creator
                                          .charAt(0)
                                          .toUpperCase()}
                                      </Avatar>
                                      {announcement.creator}
                                    </Box>
                                  </Grid>
                                  <Grid item xs={12}>
                                    {formatDateToDisplay(
                                      announcement.createdAt
                                    )}
                                  </Grid>
                                </Grid>
                              }
                            />
                          </Link>
                        </CardActions>
                      </Card>
                    </ListItem>
                  ))}
                </List>
              )}
            </Grid>
          </Grid>
        </Collapse>
      </Grid>
      <Grid>
        <Button
          sx={{
            color: "secondary.main",
            borderRadius: "20px",
            "&:hover": {
              color: accent,
            },
          }}
          onClick={handleExpandModeratorClick}
        >
          <Typography>
            {t(`userPanel.statistics.${moderatorExpanded ? "less" : "more"}`)}
          </Typography>
          {moderatorExpanded ? (
            <ExpandLessRoundedIcon />
          ) : (
            <ExpandMoreRoundedIcon />
          )}
        </Button>
      </Grid>
    </Grid>
  );
}

export default ModeratorSection;
