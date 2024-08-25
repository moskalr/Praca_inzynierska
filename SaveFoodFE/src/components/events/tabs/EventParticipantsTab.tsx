import ClearRoundedIcon from "@mui/icons-material/ClearRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Container,
  Divider,
  IconButton,
  Paper,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import size from "lodash/size";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { eaaDictionary } from "../../../constants/dictionary";
import { HTTP_POST } from "../../../constants/httpMethods";
import { CombinedEvent, ParticipantMZWO } from "../../../type/mzwo";
import fetchWithAuthorization from "../../../utils/axios/fetchWrapper";
import LoadingState from "../../../utils/loading_spinner/LoadingSpinner";
import snackbar from "../../../utils/snackbar/snackbar";

interface EventParticipantsProps {
  isParticipant: boolean;
  event: CombinedEvent;
  onEventUpdate: (updatedEvent: CombinedEvent) => void;
  onError: () => void;
}

interface UsernameFormData {
  username: string;
}

function EventParticipants({
  isParticipant,
  event,
  onEventUpdate,
  onError,
}: EventParticipantsProps) {
  const router = useRouter();
  const { t } = useTranslation(eaaDictionary);
  const { register, handleSubmit, formState, getValues, setValue } =
    useForm<UsernameFormData>();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const id = router.query.id;

  const handleUpdateParticipant = async (username: string, action: string) => {
    if (username && action) {
      try {
        const requestOptions = {
          body: JSON.stringify({ username: username, action: action }),
        };

        const response = await fetchWithAuthorization(
          `/api/events-announcements/events/participants/${id}`,
          HTTP_POST,
          requestOptions
        );

        const data = await response.json();
        if (response.ok) {
          snackbar("snackbar.successMessage.addParticipant", "success", t);
          onEventUpdate(data.event);
          return;
        } else if (data.key !== undefined) {
          snackbar(data.key, "error", t);
          onError();
        } else {
          snackbar("snackbar.errorMessage.addParticipant", "error", t);
        }
      } catch (error) {
        snackbar("snackbar.errorMessage.default", "error", t);
      }
    }
  };

  const onSubmit = async () => {
    await handleUpdateParticipant(getValues("username"), "ADD");
  };

  const handleRemoveClick = async (username: string) => {
    await handleUpdateParticipant(username, "REMOVE");
  };

  return (
    <Container component="main" maxWidth="lg">
      <Card variant="outlined">
        <CardHeader
          title={event.title}
          subheader={
            <Typography variant="caption">
              {event.participants.length} / {event.maxParticipants}
            </Typography>
          }
          sx={{ color: "secondary.main" }}
        />
        <Divider />
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Box sx={{ ml: 0, display: "flex", alignItems: "center" }}>
              <Paper
                sx={{
                  marginTop: "1vh",
                  marginBottom: "1vh",
                  display: "flex",
                  alignItems: "center",
                  width: !isMobile ? "64.5%" : "95%",
                  borderRadius: "20px",
                }}
              >
                {" "}
                <TextField
                  type="text"
                  variant="standard"
                  {...register("username")}
                  placeholder={t("events.participants.username")}
                  size="small"
                  sx={{ flex: 1, marginLeft: "1vw" }}
                />
                <Button
                  startIcon={<SearchRoundedIcon />}
                  type="submit"
                  sx={{ color: "secondary.main" }}
                >
                  {t("events.participants.add")}
                </Button>
              </Paper>
            </Box>
          </form>
          {event.participants &&
            event.participants.map((participant: ParticipantMZWO) => (
              <Box key={participant.id}>
                <Typography>{participant.username}</Typography>
                <IconButton
                  onClick={() => handleRemoveClick(participant.username)}
                >
                  <ClearRoundedIcon />
                </IconButton>
              </Box>
            ))}
          {size(event.participants) === 0 && (
            <Typography variant="caption">
              {t("events.participants.noParticipants")}
            </Typography>
          )}
          <LoadingState open={formState.isLoading} />
        </CardContent>
      </Card>
    </Container>
  );
}

export default EventParticipants;
