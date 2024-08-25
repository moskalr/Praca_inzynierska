import CancelIcon from "@mui/icons-material/Cancel";
import ModeEditRoundedIcon from "@mui/icons-material/ModeEditRounded";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  Card,
  CardContent,
  CardHeader,
  Container,
  Divider,
  Grid,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import { useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import { UserContext } from "../context/UserContextProvider";
import ConfirmationDialog from "../confirm/ConfirmationDialog";
import UndoIcon from "@mui/icons-material/Undo";
import SendIcon from "@mui/icons-material/Send";
import { EventMZWO } from "../../type/mzwo";
import { eaaDictionary } from "../../constants/dictionary";
import { CLIENT_MODERATOR } from "../../constants/roles";
import { formatDateToDisplay } from "../../utils/date/date";
import { accent } from "../../constants/colors";

const typographyVariant1 = "body2";
const typographyVariant2 = "subtitle2";

interface CustomRowProps {
  label: string;
  text: string | number;
}

const CustomRow: React.FC<CustomRowProps> = ({ label, text }) => {
  return (
    <TableRow>
      <TableCell>
        <Typography variant={typographyVariant1}>{label}</Typography>
      </TableCell>
      <TableCell>
        <Typography variant={typographyVariant2}>{text}</Typography>
      </TableCell>
    </TableRow>
  );
};

interface EventDetailsInfoProps {
  eventMZWO: EventMZWO;
  handleEdit: () => void;
  callOfArchiveUndoEvent: (state: string) => void;
}

function EventDetailsInfo({
  eventMZWO,
  handleEdit,
  callOfArchiveUndoEvent,
}: EventDetailsInfoProps) {
  const { t } = useTranslation(eaaDictionary);
  const { currentRole, usernameAccount } = useContext(UserContext);
  const [isCallOfConfirmationOpen, setIsCallOfConfirmationOpen] =
    useState(false);
  const [isArchiveConfirmationOpen, setIsArchiveConfirmationOpen] =
    useState(false);
  const [isUndoConfirmationOpen, setIsUndoConfirmationOpen] = useState(false);
  const [isActivateConfirmationOpen, setIsActivateConfirmationOpen] =
    useState(false);

  const handleCallOfOpen = () => {
    setIsCallOfConfirmationOpen((prev) => !prev);
  };

  const handleArchiveOpen = () => {
    setIsArchiveConfirmationOpen((prev) => !prev);
  };

  const handleUndoOpen = () => {
    setIsUndoConfirmationOpen((prev) => !prev);
  };

  const handleActivateOpen = () => {
    setIsActivateConfirmationOpen((prev) => !prev);
  };

  const closeConfirmation = () => {
    setIsCallOfConfirmationOpen(false);
    setIsArchiveConfirmationOpen(false);
    setIsUndoConfirmationOpen(false);
    setIsActivateConfirmationOpen(false);
  };

  const isCreatorOrModerator = () => {
    return (
      currentRole === CLIENT_MODERATOR || usernameAccount === eventMZWO.creator
    );
  };

  const shouldDisplayUndo = () => {
    if (currentRole !== CLIENT_MODERATOR) {
      return false;
    }
    return eventMZWO.state === "CANCELED" || eventMZWO.state === "ARCHIVED";
  };

  return (
    <Container
      sx={{
        height: "75vh",
        overflowY: "auto",
      }}
    >
      <Grid>
        <Card variant="outlined">
          <CardHeader
            title={eventMZWO.title}
            subheader={
              <Grid container spacing={1}>
                <Grid item xs={6}>
                  <Typography
                    variant={typographyVariant1}
                    sx={{ color: "black" }}
                  >
                    {t("objectDetails.createdAt")}:{" "}
                    {formatDateToDisplay(eventMZWO.createdAt)}
                  </Typography>
                  <Typography
                    variant={typographyVariant2}
                    sx={{
                      color:
                        eventMZWO.state === "ACTIVE"
                          ? "green"
                          : eventMZWO.state === "APPROVED"
                          ? accent
                          : "red",
                    }}
                  >
                    {t("states.state")}:{" "}
                    {t(`states.${eventMZWO.state.toLowerCase()}`)}
                  </Typography>
                </Grid>
                {isCreatorOrModerator() && (
                  <Grid
                    item
                    xs={6}
                    container
                    sx={{ right: 0 }}
                    justifyContent="flex-end"
                  >
                    {eventMZWO.state !== "ARCHIVED" && (
                      <Tooltip title={t("events.dialog.title")} placement="top">
                        <IconButton
                          sx={{ width: "fit-content" }}
                          onClick={handleEdit}
                        >
                          <ModeEditRoundedIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                    {eventMZWO.state !== "CANCELED" &&
                      eventMZWO.state === "ACTIVE" && (
                        <Tooltip title={t("events.callOff")} placement="top">
                          <IconButton
                            sx={{ width: "fit-content" }}
                            onClick={handleCallOfOpen}
                          >
                            <CancelIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                    {eventMZWO.state !== "ARCHIVED" &&
                      eventMZWO.state === "ACTIVE" && (
                        <Tooltip title={t("events.archive")} placement="top">
                          <IconButton
                            sx={{ width: "fit-content" }}
                            onClick={handleArchiveOpen}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                    {eventMZWO.state === "APPROVED" && (
                      <Tooltip title={t("events.activate")} placement="top">
                        <IconButton
                          sx={{ width: "fit-content" }}
                          onClick={handleActivateOpen}
                        >
                          <SendIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                    {shouldDisplayUndo() && (
                      <Tooltip title={t("events.undo")} placement="top">
                        <IconButton
                          sx={{ width: "fit-content" }}
                          onClick={handleUndoOpen}
                        >
                          <UndoIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Grid>
                )}
              </Grid>
            }
            sx={{ color: "secondary.main" }}
          />
          <Divider>
            <Typography color="text.secondary" variant="caption">
              {t("events.info.description")}
            </Typography>
          </Divider>
          <CardContent>
            <Typography variant="body1">{eventMZWO.content}</Typography>
          </CardContent>
          <Divider>
            <Typography color="text.secondary" variant="caption">
              {t("events.info.timeAndSlots")}
            </Typography>
          </Divider>
          <CardContent>
            <Grid container alignItems="center">
              <Grid item xs={6}>
                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <Typography align="center" variant={typographyVariant1}>
                      {t("events.fields.startDate")}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography align="center" variant={typographyVariant1}>
                      {t("events.fields.endDate")}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography align="center" variant={typographyVariant1}>
                      {formatDateToDisplay(eventMZWO.startDate)}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography align="center" variant={typographyVariant1}>
                      {formatDateToDisplay(eventMZWO.endDate)}
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={6}>
                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <Typography align="center" variant={typographyVariant1}>
                      {t("events.fields.availableSlots")}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography align="center" variant={typographyVariant1}>
                      {t("events.fields.maxParticipants")}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography align="center" variant={typographyVariant2}>
                      {eventMZWO.availableSlots}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography align="center" variant={typographyVariant2}>
                      {eventMZWO.maxParticipants}
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </CardContent>
          <Divider>
            <Typography color="text.secondary" variant="caption">
              {t("events.info.organizer")}
            </Typography>
          </Divider>
          <CardContent>
            <TableContainer component={Paper}>
              <Table>
                <TableBody>
                  <CustomRow
                    label={t("account.firstName")}
                    text={eventMZWO.organizer.firstName}
                  />
                  <CustomRow
                    label={t("account.lastName")}
                    text={eventMZWO.organizer.lastName}
                  />
                  <CustomRow
                    label={t("account.username")}
                    text={eventMZWO.organizer.username}
                  />
                  <CustomRow
                    label={t("account.email")}
                    text={eventMZWO.organizer.email}
                  />
                  <CustomRow
                    label={t("account.strikes")}
                    text={eventMZWO.organizer.strikes}
                  />
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Grid>
      <ConfirmationDialog
        isOpen={isCallOfConfirmationOpen}
        onClose={handleCallOfOpen}
        onConfirm={() => {
          callOfArchiveUndoEvent("CANCELED");
          closeConfirmation();
        }}
        message={t("confirmationDialog.cancelEvent")}
        t={t}
      />
      <ConfirmationDialog
        isOpen={isArchiveConfirmationOpen}
        onClose={handleArchiveOpen}
        onConfirm={() => {
          callOfArchiveUndoEvent("ARCHIVED");
          closeConfirmation();
        }}
        message={t("confirmationDialog.archiveEvent")}
        t={t}
      />
      <ConfirmationDialog
        isOpen={isUndoConfirmationOpen}
        onClose={handleUndoOpen}
        onConfirm={() => {
          callOfArchiveUndoEvent("ACTIVE");
          closeConfirmation();
        }}
        message={t("confirmationDialog.undoEvent")}
        t={t}
      />
      <ConfirmationDialog
        isOpen={isActivateConfirmationOpen}
        onClose={handleActivateOpen}
        onConfirm={() => {
          callOfArchiveUndoEvent("ACTIVE");
          closeConfirmation();
        }}
        message={t("confirmationDialog.activateEvent")}
        t={t}
      />
    </Container>
  );
}

export default EventDetailsInfo;
