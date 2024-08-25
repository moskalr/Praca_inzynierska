import SearchIcon from "@mui/icons-material/Search";
import TuneRoundedIcon from "@mui/icons-material/TuneRounded";
import {
  Box,
  CircularProgress,
  Grid,
  IconButton,
  Paper,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import EventCard from "../../../components/events/EventCard";
import ListFilter from "../../../components/events/filter/ListFilter";
import MobileFilterDrawer from "../../../components/events/filter/MobileFilterDrawer";
import { eaaDictionary } from "../../../constants/dictionary";
import { HTTP_GET } from "../../../constants/httpMethods";
import { EventMZWO, FilterFormData } from "../../../type/mzwo";
import fetchWithAuthorization from "../../../utils/axios/fetchWrapper";
import { sortEvents } from "../../../utils/sorting/eventSorting";
import snackbar from "../../../utils/snackbar/snackbar";
import CachedRoundedIcon from "@mui/icons-material/CachedRounded";
import { eventsPerPage } from "../../../constants/eaaPages";
import InfiniteScroll from "react-infinite-scroll-component";

interface EventsProps {
  ssrEvents: EventMZWO[];
}

export function Events({ ssrEvents }: EventsProps) {
  const { t } = useTranslation(eaaDictionary);
  const [hydrated, setHydrated] = useState(false);
  const [events, setEvents] = useState<EventMZWO[]>([]);
  const { register, handleSubmit, getValues, setValue, reset, watch } =
    useForm<FilterFormData>();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [sortFilter, setSortFilter] = useState("");
  const [filterDirection, setFilterDirection] = useState("");
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const fetchEventsList = async () => {
    try {
      const searchParams = getFiltersFromForm();
      searchParams.append("page", String(page));
      searchParams.append("size", String(eventsPerPage));
      const response = await fetchWithAuthorization(
        `/api/events-announcements/events/events?${searchParams.toString()}`,
        HTTP_GET
      );
      const data = await response.json();
      if (response.ok) {
        if (data.events.length > 0) {
          setEvents([...events, ...data.events]);
          setPage((prev) => prev + 1);
          if (data.events.length < eventsPerPage) {
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

  const handleDrawerOpen = () => {
    setIsDrawerOpen((prev) => !prev);
  };

  const getFiltersFromForm = () => {
    const queryParams = new URLSearchParams();
    queryParams.append(
      "searchString",
      String(getValues("searchString") ? getValues("searchString") : "")
    );
    queryParams.append(
      "city",
      String(getValues("city") ? getValues("city") : "")
    );
    queryParams.append(
      "street",
      String(getValues("street") ? getValues("street") : "")
    );
    queryParams.append(
      "eventState",
      String(getValues("eventState") ? getValues("eventState") : "")
    );
    queryParams.append(
      "productCategory",
      String(getValues("productCategory") ? getValues("productCategory") : "")
    );
    queryParams.append(
      "startDate",
      String(getValues("startDate") ? getValues("startDate") : "")
    );
    queryParams.append(
      "endDate",
      String(getValues("endDate") ? getValues("endDate") : "")
    );
    return queryParams;
  };

  const onSubmit = async () => {
    setPage(0);
    setEvents([]);
    await fetchEventsList();
  };

  const handleUpdateDateSection = async (
    startDate?: string,
    endDate?: string
  ) => {
    setValue("startDate", startDate ? startDate : "");
    setValue("endDate", endDate ? endDate : "");
    await onSubmit();
  };

  const handleUpdateLocationSection = async (
    city?: string,
    street?: string
  ) => {
    setValue("city", city ? city : "");
    setValue("street", street ? street : "");
    await onSubmit();
  };

  const handleUpdateStateSection = async (state?: string) => {
    setValue("eventState", state ? state : "");
    await onSubmit();
  };

  const handleUpdateCategorySection = async (category?: string) => {
    setValue("productCategory", category ? category : "");
    await onSubmit();
  };

  const resetFilters = async () => {
    reset();
    await fetchEventsList();
  };

  const handleSortParameters = (sortFilter: string, direction: string) => {
    setSortFilter(sortFilter);
    setFilterDirection(direction);
  };

  const sortedEvents = useMemo(() => {
    return sortEvents(events, sortFilter, filterDirection);
  }, [sortFilter, filterDirection, events]);

  useEffect(() => {
    setHydrated(true);
    fetchEventsList();
  }, []);

  if (!hydrated) {
    return null;
  }

  const eventsToDisplay = sortedEvents ? sortedEvents : events;
  return (
    <Box
      sx={{
        marginTop: "1vh",
        marginLeft: "2vw",
        marginRight: "2vw",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <Grid container spacing={2}>
        {isMobile && (
          <MobileFilterDrawer
            isDrawerOpen={isDrawerOpen}
            handleDrawerOpen={handleDrawerOpen}
            handleUpdateDateSection={handleUpdateDateSection}
            handleUpdateLocationSection={handleUpdateLocationSection}
            handleUpdateStateSection={handleUpdateStateSection}
            handleUpdateCategorySection={handleUpdateCategorySection}
            handleSortParameters={handleSortParameters}
            resetFilters={resetFilters}
            isMobile={isMobile}
          />
        )}
        {!isMobile && (
          <Grid item xs={3}>
            <Box
              sx={{
                position: "sticky",
                top: "10vh",
                zIndex: 1,
                height: "88vh",
                overflow: "auto",
                "&::-webkit-scrollbar": {
                  width: "0.4em",
                },
                "&::-webkit-scrollbar-thumb": {
                  backgroundColor: "transparent",
                },
                borderColor: "primary.main",
                borderRadius: "20px",
              }}
            >
              <ListFilter
                handleUpdateDateSection={handleUpdateDateSection}
                handleUpdateLocationSection={handleUpdateLocationSection}
                handleUpdateStateSection={handleUpdateStateSection}
                handleUpdateCategorySection={handleUpdateCategorySection}
                handleSortParameters={handleSortParameters}
                resetFilters={resetFilters}
                handleDrawerOpen={handleDrawerOpen}
                isMobile={isMobile}
              />
            </Box>
          </Grid>
        )}
        <Grid item xs={isMobile ? 12 : 9}>
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
            <Box sx={{ mr: 0, display: "flex", alignItems: "center" }}>
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
                {isMobile && (
                  <IconButton sx={{ p: "10px" }} onClick={handleDrawerOpen}>
                    <TuneRoundedIcon />
                  </IconButton>
                )}
                <TextField
                  type="text"
                  variant="standard"
                  {...register("searchString")}
                  placeholder={t("events.filter.search")}
                  size="small"
                  sx={{ flex: 1, marginLeft: "1vw" }}
                />
                <IconButton
                  type="submit"
                  sx={{ p: "10px" }}
                  aria-label="search"
                >
                  <SearchIcon />
                </IconButton>
              </Paper>
              <IconButton type="submit" sx={{ p: "10px" }} aria-label="refresh">
                <CachedRoundedIcon />
              </IconButton>
            </Box>
          </form>
          {events.length === 0 && (
            <Typography variant="caption" sx={{ marginTop: "3vh" }}>
              {t("lists.noResults")}
            </Typography>
          )}
          <InfiniteScroll
            dataLength={events.length}
            next={fetchEventsList}
            hasMore={hasMore}
            loader={<CircularProgress />}
            endMessage={
              events.length !== 0 && (
                <p style={{ textAlign: "center" }}>
                  <Typography variant="caption" sx={{ marginTop: "3vh" }}>
                    {t("infiniteScroll.end")}
                  </Typography>
                </p>
              )
            }
          >
            <Grid container spacing={4}>
              {eventsToDisplay.map((event: EventMZWO) => (
                <EventCard key={event.id} event={event} t={t} />
              ))}
            </Grid>
          </InfiniteScroll>
        </Grid>
      </Grid>
    </Box>
  );
}

export async function getServerSideProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, [eaaDictionary, "navbar"])),
    },
  };
}

export default Events;
