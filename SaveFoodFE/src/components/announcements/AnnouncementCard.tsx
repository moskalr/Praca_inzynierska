import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import MoreVertRoundedIcon from "@mui/icons-material/MoreVertRounded";
import ZoomInRoundedIcon from "@mui/icons-material/ZoomInRounded";
import ZoomOutRoundedIcon from "@mui/icons-material/ZoomOutRounded";
import {
  Avatar,
  Box,
  Card,
  CardContent,
  CardHeader,
  Grid,
  IconButton,
  Menu,
  MenuItem,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { useContext, useState } from "react";
import { useForm } from "react-hook-form";
import styles from "../../styles/announcement.module.css";
import { UserContext } from "../context/UserContextProvider";
import ErrorIcon from "@mui/icons-material/Error";
import ConfirmationDialog from "../confirm/ConfirmationDialog";
import { AnnouncementMZWO, CreateAnnouncementMZWO } from "../../type/mzwo";
import { CLIENT_MODERATOR } from "../../constants/roles";
import fetchWithAuthorization from "../../utils/axios/fetchWrapper";
import { HTTP_GET, HTTP_PATCH } from "../../constants/httpMethods";
import snackbar from "../../utils/snackbar/snackbar";
import { accent } from "../../constants/colors";
import { formatDate, formatTime } from "../../utils/date/date";
import LoadingState from "../../utils/loading_spinner/LoadingSpinner";

const textFieldVariant = "standard";
const announcementOperationsTranslation = "announcements.operations";

interface AnnouncementCardProps {
  announcement: AnnouncementMZWO;
  t: (key: string) => string;
  handleSave: (updatedAnnouncement: AnnouncementMZWO, index: number) => void;
  index: number;
}

interface AnnouncementFormData {
  title: string;
  content: string;
}

const AnnouncementCard = ({
  announcement,
  t,
  handleSave,
  index,
}: AnnouncementCardProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const creatorInitial = announcement.creator.charAt(0).toUpperCase();
  const [isExpanded, setIsExpanded] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const { register, handleSubmit, formState } = useForm<AnnouncementFormData>();
  const { currentRole, usernameAccount } = useContext(UserContext);
  const [announcementTag, setAnnouncementTag] = useState<string | null>(null);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);

  const editOption = t(`${announcementOperationsTranslation}.edit`);
  const archiveOption = t(`${announcementOperationsTranslation}.archive`);
  const reportOption = t(`${announcementOperationsTranslation}.report`);

  const options =
    currentRole === CLIENT_MODERATOR || usernameAccount === announcement.creator
      ? [editOption, archiveOption, reportOption]
      : [reportOption];

  const toggleExpanded = (flag: boolean) => {
    setIsExpanded(flag);
  };

  const handleEditMode = (flag: boolean) => {
    setEditMode(flag);
    getForEtag();
    toggleExpanded(flag);
  };

  const handleReportDialogOpen = () => {
    setReportDialogOpen((prev) => !prev);
  };

  const handleReport = () => {
    handleReportDialogOpen();
  };

  const handleArchiveDialogOpen = () => {
    setArchiveDialogOpen((prev) => !prev);
  };

  const handleArchive = () => {
    setArchiveDialogOpen((prev) => !prev);
  };

  const handleIsMenuOpen = () => {
    setIsMenuOpen((prev) => !prev);
  };

  const handleExpandMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
    handleIsMenuOpen();
  };

  const handleClose = (option: string) => {
    setAnchorEl(null);
    if (option === editOption) {
      handleEditMode(true);
    }
    if (option === archiveOption) {
      handleArchive();
    }
    if (option === reportOption) {
      handleReport();
    }
  };

  const getForEtag = async () => {
    try {
      const response = await fetchWithAuthorization(
        `/api/events-announcements/announcements/${announcement.id}`,
        HTTP_GET
      );

      const data = await response.json();
      if (response.ok) {
        setAnnouncementTag(data.etag);
        handleSave(data.announcement, index);
        return;
      } else if (data.key !== undefined) {
        snackbar(data.key, "error", t);
      }
    } catch (error) {
      snackbar("snackbar.errorMessage.default", "error", t);
    }
  };

  const handleUpdateAnnouncement = async (
    updatedAnnouncement: CreateAnnouncementMZWO
  ) => {
    if (updatedAnnouncement) {
      try {
        const requestOptions = {
          body: JSON.stringify({
            ...updatedAnnouncement,
            state: announcement.state,
          }),
          headers: {
            "If-Match": announcementTag,
          },
        };

        const response = await fetchWithAuthorization(
          `/api/events-announcements/announcements/${announcement.id}`,
          HTTP_PATCH,
          requestOptions
        );

        const data = await response.json();
        if (response.ok) {
          snackbar("snackbar.successMessage.announcementUpdate", "success", t);
          handleEditMode(false);
          handleSave(data.announcement, index);
          return;
        } else if (data.key !== undefined) {
          getForEtag();
          handleEditMode(false);
          snackbar(data.key, "error", t);
        } else {
          getForEtag();
          handleEditMode(false);
          snackbar("snackbar.errorMessage.announcementUpdate", "error", t);
        }
      } catch (error) {
        handleEditMode(false);
        snackbar("snackbar.errorMessage.default", "error", t);
      }
    }
  };

  const handleAnnouncementState = async (state: string) => {
    let action = state === "ARCHIVED" ? "Archive" : "Report";
    try {
      const requestOptions = {
        body: JSON.stringify({ ...announcement, state: state }),
      };

      const response = await fetchWithAuthorization(
        `/api/events-announcements/announcements/${announcement.id}`,
        HTTP_PATCH,
        requestOptions
      );

      const data = await response.json();
      if (response.ok) {
        snackbar(`snackbar.successMessage.announcement${action}`, "success", t);
        handleSave(data.announcement, index);
        handleReportDialogOpen();
        return;
      } else if (data.key !== undefined) {
        snackbar(data.key, "error", t);
      } else {
        snackbar(`snackbar.errorMessage.announcement${action}`, "error", t);
      }
    } catch (error) {
      snackbar("snackbar.errorMessage.default", "error", t);
    }
  };

  const onSubmit = async (data: AnnouncementFormData) => {
    await handleUpdateAnnouncement(data);
  };

  return (
    <Grid item xs={12} sm={6} md={4} key={announcement.id}>
      <Card
        sx={{
          marginBottom: 2,
          cursor: "pointer",
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
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardHeader
            title={
              editMode ? (
                <TextField
                  type="text"
                  variant={textFieldVariant}
                  defaultValue={announcement.title}
                  {...register("title")}
                />
              ) : (
                announcement.title
              )
            }
            action={
              <>
                {announcement.state === "REPORTED" && (
                  <IconButton>
                    <Tooltip
                      placement="top"
                      title={t("announcements.warningReported")}
                    >
                      <ErrorIcon style={{ color: "red" }} />
                    </Tooltip>
                  </IconButton>
                )}
                <IconButton onClick={() => toggleExpanded(!isExpanded)}>
                  {isExpanded ? <ZoomOutRoundedIcon /> : <ZoomInRoundedIcon />}
                </IconButton>
                <IconButton
                  aria-label="more"
                  id="long-button"
                  aria-controls={open ? "long-menu" : undefined}
                  aria-expanded={open ? "true" : undefined}
                  aria-haspopup="true"
                  onClick={handleExpandMenuClick}
                >
                  <MoreVertRoundedIcon />
                </IconButton>
                <Menu
                  id="long-menu"
                  MenuListProps={{
                    "aria-labelledby": "long-button",
                  }}
                  anchorEl={anchorEl}
                  open={open}
                  onClose={handleClose}
                >
                  {options.map((option) => (
                    <MenuItem key={option} onClick={() => handleClose(option)}>
                      {option}
                    </MenuItem>
                  ))}
                </Menu>
              </>
            }
            subheader={
              <Grid container justifyContent="space-between" xs={12}>
                <Grid item xs={11}>
                  <Box
                    display="flex"
                    justifyContent="flex-start"
                    alignItems="center"
                  >
                    <Avatar sx={{ backgroundColor: "secondary.main" }}>
                      {creatorInitial}
                    </Avatar>
                    {announcement.creator}
                    {editMode && <IconButton></IconButton>}
                  </Box>
                </Grid>
                <Grid item xs={1}></Grid>
              </Grid>
            }
          />

          <CardContent
            sx={{
              backgroundColor: "primary.main",
              maxHeight: isExpanded ? "100%" : "60px",
              overflow: "hidden",
            }}
          >
            <Box display="flex" alignItems="center">
              {editMode && (
                <Typography>
                  <TextField
                    type="text"
                    variant={textFieldVariant}
                    defaultValue={announcement.content}
                    {...register("content")}
                    size="small"
                    multiline
                  />
                </Typography>
              )}
              {!editMode && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  className={
                    styles[
                      isExpanded ? "expanded-content" : "truncated-content"
                    ]
                  }
                  style={{ wordWrap: "break-word" }}
                >
                  {announcement.content}
                </Typography>
              )}
            </Box>
          </CardContent>
          {editMode && (
            <CardContent sx={{ backgroundColor: "primary.main" }}>
              <Typography>
                <IconButton type="submit">
                  <CheckRoundedIcon />
                </IconButton>
                <IconButton onClick={() => handleEditMode(false)}>
                  <CloseRoundedIcon />
                </IconButton>
              </Typography>
            </CardContent>
          )}
          <CardContent sx={{ backgroundColor: "primary.main" }}>
            <Box display="flex" alignItems="center">
              <Typography variant="body2" color="text.secondary">
                {formatDate(announcement.createdAt)}{" "}
                {formatTime(announcement.createdAt)}
              </Typography>
            </Box>
          </CardContent>
        </form>
        <LoadingState open={formState.isSubmitting} />
      </Card>
      <ConfirmationDialog
        isOpen={reportDialogOpen}
        onClose={handleReportDialogOpen}
        onConfirm={() => handleAnnouncementState("REPORTED")}
        message={t("announcements.reportConfirmation")}
        t={t}
      />
      <ConfirmationDialog
        isOpen={archiveDialogOpen}
        onClose={handleArchiveDialogOpen}
        onConfirm={() => handleAnnouncementState("ARCHIVED")}
        message={t("announcements.archiveConfirmation")}
        t={t}
      />
    </Grid>
  );
};

export default AnnouncementCard;
