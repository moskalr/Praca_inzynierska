import { Grid } from "@mui/material";
import dayjs from "dayjs";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { UserContext } from "../../components/context/UserContextProvider";
import EventStepper from "../../components/events/stepper/EventStepper";
import AccountStatisticsSection from "../../components/events/userPanel/AccountStatisticsSection";
import ListsSection from "../../components/events/userPanel/ListsSection";
import ModeratorSection from "../../components/events/userPanel/ModeratorSection";
import OrganizeEventCard from "../../components/events/userPanel/OrganizeEventCard";
import PublishAnnouncement from "../../components/events/userPanel/PublishAnnouncement";
import { eaaDictionary } from "../../constants/dictionary";
import { HTTP_GET } from "../../constants/httpMethods";
import { initialAccountStatistics } from "../../constants/initialEAAData";
import {
  AccountStatistics,
  AnnouncementMZWO,
  EventMZWO,
} from "../../type/mzwo";
import fetchWithAuthorization from "../../utils/axios/fetchWrapper";
import { formatLocalDateTime } from "../../utils/date/date";
import snackbar from "../../utils/snackbar/snackbar";

function UserPanel() {
  const { t } = useTranslation(eaaDictionary);
  const [hydrated, setHydrated] = useState(false);
  const [myEvents, setMyEvents] = useState<EventMZWO[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<EventMZWO[]>([]);
  const [myAnnouncements, setMyAnnouncements] = useState<AnnouncementMZWO[]>(
    []
  );
  const [listsExpanded, setListsExpanded] = useState(false);
  const [pendingEvents, setPendingEvents] = useState<EventMZWO[]>([]);
  const [reportedAnnouncements, setReportedAnnouncements] = useState<
    AnnouncementMZWO[]
  >([]);
  const [isStepperOpen, setIsStepperOpen] = useState(false);
  const [moderatorPanelExpanded, setModeratorPanelExpanded] = useState(false);
  const [accountStatistics, setAccountStatistics] = useState<AccountStatistics>(
    initialAccountStatistics
  );
  const { currentRole, usernameAccount } = useContext(UserContext);

  const fetchEventsList = async () => {
    try {
      const filters = new URLSearchParams();
      filters.append("ownFilter", "OWN");

      const response = await fetchWithAuthorization(
        `/api/events-announcements/events/events?${filters.toString()}`,
        HTTP_GET
      );
      if (response.ok) {
        const data = await response.json();
        setMyEvents(data.events);
        return;
      }
      snackbar("error_message.error", "error", t);
    } catch (error) {
      snackbar("snackbar.errorMessage.default", "error", t);
    }
  };

  const handleExpandListsClick = () => {
    if (!listsExpanded) {
      if (myEvents.length === 0) {
        fetchEventsList();
      }
      if (myAnnouncements.length === 0) {
        fetchAnnouncementsList();
      }
      if (upcomingEvents.length === 0) {
        fetchUpcomingEventsList();
      }
    }
    setListsExpanded((prev) => !prev);
  };

  const handleExpandModeratorClick = () => {
    if (!moderatorPanelExpanded) {
      if (pendingEvents.length === 0) {
        fetchPendingEventsList();
      }
      if (reportedAnnouncements.length === 0) {
        fetchReportedAnnonucementsList();
      }
    }
    setModeratorPanelExpanded((prev) => !prev);
  };

  const fetchAnnouncementsList = async () => {
    try {
      const filters = new URLSearchParams();
      filters.append("ownFilter", "OWN");

      const response = await fetchWithAuthorization(
        `/api/events-announcements/announcements/announcements?${filters.toString()}`,
        HTTP_GET
      );
      if (response.ok) {
        const data = await response.json();
        setMyAnnouncements(data.announcements);
        return;
      }
    } catch (error) {
      snackbar("snackbar.errorMessage.default", "error", t);
    }
  };

  const fetchUpcomingEventsList = async () => {
    try {
      const filters = new URLSearchParams();
      const upcomingTime = dayjs().add(7, "days") as unknown as Date;
      filters.append(
        "endDate",
        formatLocalDateTime(upcomingTime.toLocaleString())
      );
      filters.append("state", "ACTIVE");
      const response = await fetchWithAuthorization(
        `/api/events-announcements/events/events?${filters.toString()}`,
        HTTP_GET
      );
      if (response.ok) {
        const data = await response.json();
        setUpcomingEvents(data.events);
        return;
      }
    } catch (error) {
      snackbar("snackbar.errorMessage.default", "error", t);
    }
  };

  const updateMyEvents = () => {
    fetchEventsList();
  };

  const fetchPendingEventsList = async () => {
    try {
      const filters = new URLSearchParams();
      filters.append("eventState", "PENDING");

      const response = await fetchWithAuthorization(
        `/api/events-announcements/events/events?${filters.toString()}`,
        HTTP_GET
      );
      if (response.ok) {
        const data = await response.json();
        setPendingEvents(data.events);
        return;
      }
    } catch (error) {
      snackbar("snackbar.errorMessage.default", "error", t);
    }
  };

  const fetchReportedAnnonucementsList = async () => {
    try {
      const filters = new URLSearchParams();
      filters.append("announcementState", "REPORTED");

      const response = await fetchWithAuthorization(
        `/api/events-announcements/announcements/announcements?${filters.toString()}`,
        HTTP_GET
      );
      if (response.ok) {
        const data = await response.json();
        setReportedAnnouncements(data.announcements);
        return;
      }
    } catch (error) {
      snackbar("snackbar.errorMessage.default", "error", t);
    }
  };

  const fetchAccountStatistics = async () => {
    try {
      const response = await fetchWithAuthorization(
        `/api/events-announcements/account/getStatistics`,
        HTTP_GET
      );
      if (response.ok) {
        const data = await response.json();
        setAccountStatistics(data.statistics);
        return;
      }
    } catch (error) {
      snackbar("snackbar.errorMessage.default", "error", t);
    }
  };

  useEffect(() => {
    setHydrated(true);
    fetchAccountStatistics();
  }, []);

  if (!hydrated) {
    return null;
  }

  const handleStepperOpen = () => {
    setIsStepperOpen((prev) => !prev);
  };

  return (
    <Grid
      container
      spacing={2}
      justifyContent="space-evenly"
      sx={{ marginTop: "2vh" }}
    >
      <Grid
        item
        xs={11}
        spacing={2}
        sx={{
          backgroundColor: "primary.main",
          borderRadius: "20px",
          display: "flex",
          textAlign: "center",
          justifyContent: "space-evenly",
        }}
        marginBottom="2vh"
      >
        <Grid item xs={5.5}>
          <OrganizeEventCard updateEvents={updateMyEvents} />
        </Grid>
        <Grid item xs={5.5}>
          <PublishAnnouncement />
        </Grid>
      </Grid>
      <Grid
        item
        xs={11}
        sx={{
          backgroundColor: "primary.main",
          borderRadius: "20px",
          display: "flex",
          flexDirection: "column",
          textAlign: "center",
        }}
        marginBottom="2vh"
      >
        <AccountStatisticsSection accountStatistics={accountStatistics} />
      </Grid>
      <ListsSection
        myEvents={myEvents}
        upcomingEvents={upcomingEvents}
        myAnnouncements={myAnnouncements}
        handleExpandListsClick={handleExpandListsClick}
        listsExpanded={listsExpanded}
      />
      {currentRole === "CLIENT_MODERATOR" && (
        <ModeratorSection
          pendingEvents={pendingEvents}
          reportedAnnouncements={reportedAnnouncements}
          handleExpandModeratorClick={handleExpandModeratorClick}
          moderatorExpanded={moderatorPanelExpanded}
        />
      )}
      {isStepperOpen && (
        <EventStepper
          open={isStepperOpen}
          onClose={handleStepperOpen}
          handleFormOpen={handleStepperOpen}
          updateEvents={fetchEventsList}
        />
      )}
    </Grid>
  );
}

export async function getServerSideProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, [eaaDictionary, "navbar"])),
    },
  };
}

export default UserPanel;
