import CachedRoundedIcon from "@mui/icons-material/CachedRounded";
import SearchIcon from "@mui/icons-material/Search";
import {
  Box,
  Chip,
  Container,
  Grid,
  IconButton,
  Paper,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { CircularProgress } from "@nextui-org/react";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import InfiniteScroll from "react-infinite-scroll-component";
import AnnouncementCard from "../../../components/announcements/AnnouncementCard";
import { accent } from "../../../constants/colors";
import { eaaDictionary } from "../../../constants/dictionary";
import { announcementsPerPage } from "../../../constants/eaaPages";
import { HTTP_GET } from "../../../constants/httpMethods";
import { AnnouncementMZWO, FilterFormData } from "../../../type/mzwo";
import fetchWithAuthorization from "../../../utils/axios/fetchWrapper";
import { sortAnnouncements } from "../../../utils/sorting/announcementSorting";
import snackbar from "../../../utils/snackbar/snackbar";

interface SortingChipProps {
  sortingDirection: string;
  label: string;
  setSortingDirection: (sortingDirection: string) => void;
  clicked: boolean;
}

const SortingChip: React.FC<SortingChipProps> = ({
  sortingDirection,
  label,
  setSortingDirection,
  clicked,
}) => {
  return (
    <Chip
      sx={{
        "&:hover": {
          transform: "scale(1.02)",
          backgroundColor: accent,
          color: "white",
        },
        backgroundColor: clicked ? accent : "primary.main",
        color: clicked ? "white" : "secondary.main",
      }}
      label={label}
      onClick={() => setSortingDirection(sortingDirection)}
    />
  );
};

function Announcements() {
  const { t } = useTranslation(eaaDictionary);
  const [hydrated, setHydrated] = useState(false);
  const [announcements, setAnnouncements] = useState<AnnouncementMZWO[]>([]);
  const { register, handleSubmit, getValues } = useForm<FilterFormData>();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [sortingDirection, setSortingDirection] = useState<string>("newest");
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const handleChipClicked = (sortingDirection: string) => {
    setSortingDirection(sortingDirection);
  };

  const getSearchString = () => {
    const queryParams = new URLSearchParams();
    queryParams.append(
      "searchString",
      String(getValues("searchString") ? getValues("searchString") : "")
    );
    return queryParams;
  };

  const fetchAnnouncementsList = async () => {
    try {
      const searchParams = getSearchString();
      searchParams.append("page", String(page));
      searchParams.append("size", String(announcementsPerPage));
      const response = await fetchWithAuthorization(
        `/api/events-announcements/announcements/announcements?${searchParams.toString()}`,
        HTTP_GET
      );
      const data = await response.json();
      if (response.ok) {
        if (data.announcements.length > 0) {
          setAnnouncements([...announcements, ...data.announcements]);
          setPage((prev) => prev + 1);
          if (data.announcements.length < announcementsPerPage) {
            setHasMore(false);
          }
        } else {
          setHasMore(false);
        }
      }
    } catch (error) {
      snackbar("snackbar.errorMessage.default", "error", t);
    }
  };

  const sortedAnnouncements = useMemo(() => {
    return sortAnnouncements(announcements, sortingDirection);
  }, [sortingDirection, announcements]);

  useEffect(() => {
    setHydrated(true);
    fetchAnnouncementsList();
  }, []);

  if (!hydrated) {
    return null;
  }

  const updateAnnouncementsList = (
    updatedAnnouncement: AnnouncementMZWO,
    index: number
  ) => {
    const updatedAnnouncements = [...announcements];
    if (updatedAnnouncement.state === "ARCHIVED") {
      updatedAnnouncements.splice(index, 1);
    } else {
      updatedAnnouncements[index] = updatedAnnouncement;
    }
    setAnnouncements(updatedAnnouncements);
  };

  const onSubmit = async () => {
    setPage(0);
    setAnnouncements([]);
    await fetchAnnouncementsList();
  };

  const announcementsToDisplay = sortedAnnouncements
    ? sortedAnnouncements
    : announcements;

  return (
    <Container component="main" maxWidth="lg">
      <Box
        sx={{
          marginTop: "1vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "100%",
        }}
      >
        <form
          onSubmit={handleSubmit(onSubmit)}
          style={{
            position: "sticky",
            top: "7.8vh",
            zIndex: 1,
            height: "7vh",
            backgroundColor: "white",
            marginBottom: "2vh",
            width: "100%",
          }}
        >
          <Box sx={{ ml: 0, display: "flex", alignItems: "center" }}>
            <Paper
              sx={{
                marginTop: "1vh",
                marginBottom: "1vh",
                display: "flex",
                alignItems: "center",
                width: !isMobile ? "64.5%" : "95%",
                borderRadius: "20px",
                marginLeft: "1vw",
              }}
            >
              <TextField
                type="text"
                variant="standard"
                {...register("searchString")}
                placeholder={t("events.filter.search")}
                size="small"
                sx={{ flex: 1, marginLeft: "1vw" }}
              />
              <IconButton type="submit" sx={{ p: "10px" }} aria-label="search">
                <SearchIcon />
              </IconButton>
            </Paper>
            <IconButton type="submit" sx={{ p: "10px" }} aria-label="refresh">
              <CachedRoundedIcon />
            </IconButton>
            <SortingChip
              sortingDirection="newest"
              label={t(`sorting.newest`)}
              setSortingDirection={() => handleChipClicked("newest")}
              clicked={sortingDirection === "newest"}
            />
            <SortingChip
              sortingDirection="oldest"
              label={t(`sorting.oldest`)}
              setSortingDirection={() => handleChipClicked("oldest")}
              clicked={sortingDirection === "oldest"}
            />
          </Box>
        </form>
        {announcements.length === 0 && (
          <Typography variant="caption" sx={{ marginTop: "3vh" }}>
            {t("lists.noResults")}
          </Typography>
        )}
        <InfiniteScroll
          dataLength={announcements.length}
          next={fetchAnnouncementsList}
          hasMore={hasMore}
          loader={<CircularProgress />}
          endMessage={
            announcements.length !== 0 && (
              <p style={{ textAlign: "center" }}>
                <Typography variant="caption" sx={{ marginTop: "3vh" }}>
                  {t("infiniteScroll.end")}
                </Typography>
              </p>
            )
          }
        >
          <Grid container spacing={2}>
            {announcementsToDisplay.map((announcement, index) => (
              <AnnouncementCard
                key={announcement.id}
                announcement={announcement}
                t={t}
                index={index}
                handleSave={updateAnnouncementsList}
              />
            ))}
          </Grid>
        </InfiniteScroll>
      </Box>
    </Container>
  );
}

export async function getServerSideProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, [eaaDictionary, "navbar"])),
    },
  };
}

export default Announcements;
