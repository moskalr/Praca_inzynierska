import FmdGoodRoundedIcon from "@mui/icons-material/FmdGoodRounded";
import GroupRoundedIcon from "@mui/icons-material/GroupRounded";
import InfoRoundedIcon from "@mui/icons-material/InfoRounded";
import ListRoundedIcon from "@mui/icons-material/ListRounded";
import WorkRoundedIcon from "@mui/icons-material/WorkRounded";
import {
  Box,
  Tab,
  Tabs,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { NextApiRequest } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useRouter } from "next/router";
import React, { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { UserContext } from "../../../components/context/UserContextProvider";
import SignUpFooter from "../../../components/events/footer/SignUpFooter";
import EventInfoTab from "../../../components/events/tabs/EventInfoTab";
import EventLocationTab from "../../../components/events/tabs/EventLocationTab";
import EventParticipants from "../../../components/events/tabs/EventParticipantsTab";
import EventProductTab from "../../../components/events/tabs/EventProductTab";
import EventReservationsTab from "../../../components/events/tabs/EventReservationsTab";
import LinkTab from "../../../components/events/tabs/LinkTab";
import TabPanel from "../../../components/events/tabs/TabPanel";
import { eaaDictionary } from "../../../constants/dictionary";
import { HTTP_GET } from "../../../constants/httpMethods";
import { CLIENT_MODERATOR } from "../../../constants/roles";
import { CombinedEvent, ReservationMZWO } from "../../../type/mzwo";
import fetchWithAuthorization from "../../../utils/axios/fetchWrapper";
import LoadingState from "../../../utils/loading_spinner/LoadingSpinner";
import snackbar from "../../../utils/snackbar/snackbar";

function EventDetailsPage() {
  const [tabValue, setTabValue] = useState(0);
  const [event, setEvent] = useState<CombinedEvent>();
  const [myReservation, setMyReservation] = useState<ReservationMZWO>();
  const [loadingState, setLoadingState] = useState(true);
  const [isParticipant, setIsParticipant] = useState(false);
  const router = useRouter();
  const [hydrated, setHydrated] = useState(false);
  const [eventTag, setEventTag] = useState<string>();
  const [reservationTag, setReservationTag] = useState<string>();
  const { t } = useTranslation(eaaDictionary);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const id = router.query.id;
  const { currentRole, usernameAccount } = useContext(UserContext);

  const handleTabChange = (_event: React.ChangeEvent<{}>, newValue: number) => {
    setTabValue(newValue);
  };

  const handleUpdateEvent = (updatedEvent: CombinedEvent) => {
    setEvent(updatedEvent);
    fetchEvent();
  };

  const handleUpdateReservationEtag = (newEtag?: string) => {
    if (newEtag && myReservation) {
      setReservationTag(newEtag);
    }
  };

  const fetchMyReservation = async () => {
    try {
      const response = await fetchWithAuthorization(
        `/api/events-announcements/events/reservations/myReservation/${id}`,
        HTTP_GET
      );
      if (response.ok) {
        const data = await response.json();
        setMyReservation(data.reservation);
        setLoadingState(false);
        setReservationTag(data.etag);
        return;
      }
      setLoadingState(false);
    } catch (error) {
      snackbar("snackbar.errorMessage.default", "error", t);
      setLoadingState(false);
    }
  };
  const fetchEvent = async () => {
    try {
      const response = await fetchWithAuthorization(
        `/api/events-announcements/events/${id}`,
        HTTP_GET
      );
      if (response.ok) {
        const data = await response.json();
        setEvent(data.event);
        setIsParticipant(data.event.isParticipant);
        setLoadingState(false);
        setEventTag(data.etag);
        return;
      }
      setLoadingState(false);
    } catch (error) {
      snackbar("snackbar.errorMessage.default", "error", t);
      setLoadingState(false);
    }
  };

  const handleOutdatedData = () => {
    fetchEvent();
  };

  useEffect(() => {
    setHydrated(true);
    fetchEvent();
    fetchMyReservation();
  }, [router.query.id, isParticipant]);

  if (!hydrated) {
    return null;
  }

  const isCreatorOrModerator = () => {
    return (
      currentRole === CLIENT_MODERATOR || usernameAccount === event?.creator
    );
  };

  return (
    <Box display="flex" flexDirection="column" flexGrow={1} height="100%">
      <LoadingState open={loadingState} />
      {event !== undefined && !loadingState && (
        <div>
          <Tabs
            variant={isMobile ? "scrollable" : "fullWidth"}
            value={tabValue}
            onChange={handleTabChange}
            indicatorColor="secondary"
            textColor="secondary"
          >
            <Tab icon={<WorkRoundedIcon />} label={t("events.tabs.info")} />
            <Tab
              icon={<FmdGoodRoundedIcon />}
              label={t("events.tabs.localization")}
            />
            <Tab icon={<InfoRoundedIcon />} label={t("events.tabs.product")} />
            {isCreatorOrModerator() && (
              <Tab
                icon={<GroupRoundedIcon />}
                label={t("events.tabs.participants")}
              />
            )}
            {isCreatorOrModerator() && (
              <Tab
                icon={<ListRoundedIcon />}
                label={t("events.tabs.reservations")}
              />
            )}
            <LinkTab
              href={"/events-announcements/events"}
              label={t("events.tabs.back")}
            />
          </Tabs>

          <TabPanel value={tabValue} index={0}>
            <EventInfoTab
              event={event}
              eventTag={eventTag}
              onEventUpdate={handleUpdateEvent}
              {...{ isParticipant }}
              onError={handleOutdatedData}
            />
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <EventLocationTab event={event} />
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <EventProductTab
              event={event}
              responseReservation={myReservation}
              reservationTag={reservationTag}
              onReservationUpdate={fetchMyReservation}
            />
          </TabPanel>
          {isCreatorOrModerator() && (
            <TabPanel value={tabValue} index={3}>
              <EventParticipants
                event={event}
                {...{ isParticipant }}
                onEventUpdate={handleUpdateEvent}
                onError={handleOutdatedData}
              />
            </TabPanel>
          )}
          {isCreatorOrModerator() && (
            <TabPanel value={tabValue} index={4}>
              <EventReservationsTab />
            </TabPanel>
          )}
          {usernameAccount !== event.creator && (
            <SignUpFooter
              event={event}
              {...{ isParticipant, setIsParticipant }}
            />
          )}
        </div>
      )}
      {event === undefined && !loadingState && (
        <Typography variant="h5">{t("events.error.notFound")}</Typography>
      )}
    </Box>
  );
}

interface SSRProps {
  locale: string;
  req: NextApiRequest;
  query: {
    id: string;
  };
}

export async function getServerSideProps({ locale, req, query }: SSRProps) {
  return {
    props: {
      ...(await serverSideTranslations(locale, [eaaDictionary, "navbar"])),
    },
  };
}

export default EventDetailsPage;
