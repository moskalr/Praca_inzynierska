import ErrorIcon from "@mui/icons-material/Error";
import ExpandLessRoundedIcon from "@mui/icons-material/ExpandLessRounded";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import {
  Button,
  Card,
  CardActions,
  CardHeader,
  Collapse,
  Divider,
  Grid,
  IconButton,
  Link,
  List,
  ListItem,
  Tooltip,
  Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { accent } from "../../../constants/colors";
import { eaaDictionary } from "../../../constants/dictionary";
import { AnnouncementMZWO, EventMZWO } from "../../../type/mzwo";
import { formatDate, formatTime } from "../../../utils/date/date";

interface ListsSectionProps {
  myEvents: EventMZWO[];
  upcomingEvents: EventMZWO[];
  myAnnouncements: AnnouncementMZWO[];
  handleExpandListsClick: () => void;
  listsExpanded: boolean;
}

function ListsSection({
  myEvents,
  upcomingEvents,
  myAnnouncements,
  handleExpandListsClick,
  listsExpanded,
}: ListsSectionProps) {
  const { t } = useTranslation(eaaDictionary);
  const listsPanelGridSize = 3.99;

  const stateBorderColor = (state: string) => {
    let borderColor;

    switch (state) {
      case "ACTIVE":
        borderColor = "green";
        break;
      case "APPROVED":
        borderColor = accent;
        break;
      case "PENDING":
        borderColor = "yellow";
        break;
      case "REJECTED":
        borderColor = "red";
        break;
      case "CANCELED":
      case "FINISHED":
        borderColor = "black";
        break;
      default:
        borderColor = "secondary.main";
        break;
    }

    return borderColor;
  };

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
        <Grid item xs={listsPanelGridSize}>
          <Divider textAlign="center" flexItem>
            <Typography variant="subtitle1">
              {t("userPanel.events.my")}
            </Typography>
          </Divider>
        </Grid>
        <Grid item xs={listsPanelGridSize}>
          <Divider textAlign="center" flexItem>
            <Typography variant="subtitle1">
              {t("userPanel.events.upcoming")}
            </Typography>
          </Divider>
        </Grid>
        <Grid item xs={listsPanelGridSize}>
          <Divider textAlign="center" flexItem>
            <Typography variant="subtitle1">
              {t("userPanel.announcements.my")}
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
          in={listsExpanded}
          timeout={1000}
        >
          <Grid container item xs={12}>
            <Grid
              item
              xs={listsPanelGridSize}
              sx={{
                backgroundColor: "primary.main",
                borderRadius: "20px",
                overflowY: "auto",
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
              {myEvents.length === 0 && (
                <Typography>{t("userPanel.events.emptyList")}</Typography>
              )}
              {myEvents.length !== 0 && (
                <List>
                  {myEvents.map((event) => (
                    <ListItem>
                      <Card
                        sx={{
                          borderRadius: "20px",
                          width: "90%",
                          transition: "transform 0.2s",
                          "&:hover": {
                            transform: "scale(1.02)",
                          },
                          borderColor: stateBorderColor(event.state),
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
                              action={
                                <>
                                  {event.state === "REJECTED" && (
                                    <IconButton>
                                      <Tooltip
                                        placement="top"
                                        title={t(
                                          "userPanel.events.warningRejected"
                                        )}
                                      >
                                        <ErrorIcon style={{ color: "red" }} />
                                      </Tooltip>
                                    </IconButton>
                                  )}
                                  {event.state === "APPROVED" && (
                                    <IconButton>
                                      <Tooltip
                                        placement="top"
                                        title={t(
                                          "userPanel.events.warningApproved"
                                        )}
                                      >
                                        <ErrorIcon style={{ color: "green" }} />
                                      </Tooltip>
                                    </IconButton>
                                  )}
                                </>
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
            <Divider orientation="vertical" />{" "}
            <Grid
              item
              xs={listsPanelGridSize}
              sx={{
                backgroundColor: "primary.main",
                borderRadius: "20px",
                overflowY: "auto",
                marginTop: "2vh",
                maxHeight: "70vh",
                position: "relative",
                "&::-webkit-scrollbar": {
                  width: "5px",
                },
                "&::-webkit-scrollbar-thumb": {
                  backgroundColor: "secondary.main",
                  borderRadius: "10px",
                },
              }}
            >
              {upcomingEvents.length === 0 && (
                <Typography>{t("userPanel.events.emptyUpcoming")}</Typography>
              )}
              {upcomingEvents.length !== 0 && (
                <List>
                  {upcomingEvents.map((event) => (
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
            <Divider orientation="vertical" />{" "}
            <Grid
              item
              xs={listsPanelGridSize}
              sx={{
                backgroundColor: "primary.main",
                borderRadius: "20px",
                overflowY: "auto",
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
              {myAnnouncements.length === 0 && (
                <Typography>
                  {t("userPanel.announcements.emptyList")}
                </Typography>
              )}
              {myAnnouncements.length !== 0 && (
                <List>
                  {myAnnouncements.map((announcement) => (
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
                        <CardHeader
                          title={
                            <span style={{ fontSize: "19px" }}>
                              {announcement.title}
                            </span>
                          }
                          subheader={
                            <p>
                              {t(`states.${announcement.state.toLowerCase()}`)}
                            </p>
                          }
                        />
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
          onClick={handleExpandListsClick}
        >
          <Typography>
            {t(`userPanel.statistics.${listsExpanded ? "less" : "more"}`)}
          </Typography>
          {listsExpanded ? (
            <ExpandLessRoundedIcon />
          ) : (
            <ExpandMoreRoundedIcon />
          )}
        </Button>
      </Grid>
    </Grid>
  );
}

export default ListsSection;
