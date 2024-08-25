import CloseIcon from "@mui/icons-material/Close";
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  Grid,
  IconButton,
  Tooltip,
  Typography,
} from "@mui/material";
import { useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import { accent } from "../../../constants/colors";
import { eaaDictionary } from "../../../constants/dictionary";
import { HTTP_PATCH } from "../../../constants/httpMethods";
import { CLIENT_MODERATOR } from "../../../constants/roles";
import {
  CombinedEvent,
  EventMZWO,
  ModeratorEventMZWO,
} from "../../../type/mzwo";
import fetchWithAuthorization from "../../../utils/axios/fetchWrapper";
import snackbar from "../../../utils/snackbar/snackbar";
import { UserContext } from "../../context/UserContextProvider";
import EventDetailsInfo from "../EventDetailsInfo";
import EditEventForm from "../form/EditEventForm";

interface EventInfoTabProps {
  event: CombinedEvent;
  eventTag?: string;
  onEventUpdate: (updatedEvent: CombinedEvent) => void;
  onError: () => void;
}

function EventInfoTab({
  event,
  eventTag,
  onEventUpdate,
  onError,
}: EventInfoTabProps) {
  const { t } = useTranslation(eaaDictionary);
  const [editMode, setEditMode] = useState(false);
  const { currentRole, usernameAccount } = useContext(UserContext);

  const handleEdit = () => {
    setEditMode((prev) => !prev);
  };

  const handleSave = (updatedEvent: EventMZWO & ModeratorEventMZWO) => {
    setEditMode(false);
    onEventUpdate(updatedEvent);
  };

  const shouldDisplayAcceptReject = () => {
    return (
      event.state === "PENDING" &&
      currentRole === CLIENT_MODERATOR &&
      usernameAccount !== event.creator
    );
  };

  const changeStateClick = async (state: string) => {
    try {
      const requestOptions = {
        body: JSON.stringify({
          updatedEvent: { ...event, state: state },
        }),
        headers: {
          "If-Match": eventTag,
        },
      };
      const response = await fetchWithAuthorization(
        `/api/events-announcements/events/patchEvent`,
        HTTP_PATCH,
        requestOptions
      );

      const data = await response.json();
      if (response.ok) {
        snackbar(
          `snackbar.successMessage.${state.toLowerCase()}`,
          "success",
          t
        );
        handleEdit();
        handleSave({ ...event, state: state });
        return;
      } else if (data.key !== undefined) {
        snackbar(data.key, "error", t);
        onError();
      } else {
        snackbar(
          `snackbar.successMessage.${state.toLowerCase()}`,
          "success",
          t
        );
      }
    } catch (error) {
      snackbar("snackbar.errorMessage.default", "error", t);
    }
  };

  return (
    <>
      {shouldDisplayAcceptReject() && (
        <Box>
          <Button
            sx={{ color: accent }}
            onClick={() => changeStateClick("APPROVED")}
          >
            {t("events.approve")}
          </Button>{" "}
          <Button
            sx={{ color: accent }}
            onClick={() => changeStateClick("REJECTED")}
          >
            {t("events.reject")}
          </Button>
        </Box>
      )}
      {editMode && (
        <Dialog
          open={editMode}
          scroll="paper"
          sx={{
            "& .MuiDialog-container": {
              "& .MuiPaper-root": {
                width: "100%",
                height: "100%",
                backgroundColor: "primary.main",
              },
            },
          }}
        >
          <DialogTitle>
            <Grid container xs={12}>
              <Grid item xs={10}>
                <Typography variant="h6" color="secondary.main">
                  {t("events.dialog.title")}
                </Typography>
              </Grid>
              <Grid item xs={2} justifyContent="flex-end">
                <Tooltip title={t("events.stepper.cancel")} placement="top">
                  <IconButton onClick={handleEdit}>
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
          <EditEventForm
            eventMZWO={event}
            handleEdit={handleEdit}
            handleSave={handleSave}
            eventTag={eventTag}
            onError={onError}
          />
        </Dialog>
      )}
      {!editMode && (
        <EventDetailsInfo
          eventMZWO={event}
          handleEdit={handleEdit}
          callOfArchiveUndoEvent={changeStateClick}
        />
      )}
    </>
  );
}

export default EventInfoTab;
