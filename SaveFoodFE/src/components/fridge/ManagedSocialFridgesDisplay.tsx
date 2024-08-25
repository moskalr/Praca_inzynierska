import CachedIcon from "@mui/icons-material/Cached";
import FilterListIcon from "@mui/icons-material/FilterList";
import KitchenIcon from "@mui/icons-material/Kitchen";
import SortByAlphaIcon from "@mui/icons-material/SortByAlpha";
import {
  Box,
  Button,
  Checkbox,
  Container,
  FormControlLabel,
  IconButton,
  List,
  ListItem,
  Popover,
} from "@mui/material";
import Avatar from "@mui/material/Avatar";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import router from "next/router";
import { useEffect, useMemo, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import AddFridge from "../../components/fridge/AddFridge";
import { secondary } from "../../constants/colors";
import { HTTP_UNAUTHORIZED } from "../../constants/httpCodes";
import { HTTP_GET } from "../../constants/httpMethods";
import { ACTIVE, ARCHIVED, INACTIVE } from "../../constants/socialFridgeStates";
import { Account, LatLng, SocialFridge } from "../../type/mzls";
import fetchWithAuthorization from "../../utils/axios/fetchWrapper";
import LoadingSpinner from "../../utils/loading_spinner/LoadingSpinner";
import { getUserLocation } from "../../utils/location/location";
import snackbar from "../../utils/snackbar/snackbar";
import sortByStreet from "../../utils/sorting/sortByStreet";
import ManagedSocialFridge from "./ManagedSocialFridge";

interface ManagedSocialFridgesProps {
  t: Function;
}

enum DialogType {
  None,
  AddFridge,
}

const ManagedSocialFridges: React.FC<ManagedSocialFridgesProps> = ({ t }) => {
  const [socialFridges, setSocialFridges] = useState<SocialFridge[]>([]);
  const [openFilter, setOpenFilter] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [viewFilters, setViewFilters] = useState<String[]>([ACTIVE]);
  const [ascendingOrder, setAscendingOrder] = useState(true);
  const [currentDialog, setCurrentDialog] = useState(DialogType.None);
  const [userLocation, setUserLocation] = useState<LatLng>();
  const [managers, setManagers] = useState<Account[]>([]);
  const [loadingState, setLoadingState] = useState(true);
  const itemsPerPage = 12;
  const [hasMore, setHasMore] = useState(true);
  const [nextPage, setNextPage] = useState(0);

  const fetchManagersData = async () => {
    const fullPath = `/api/social-fridge/managers`;

    await fetchWithAuthorization(fullPath, HTTP_GET)
      .then((response) => {
        if (response.status === HTTP_UNAUTHORIZED) {
          snackbar("errors.unauthorized", "error", t);
          router.push("/login");
        }
        return response.json();
      })
      .then((data) => {
        setManagers(data.managers);
      })
      .catch((error) => {
        snackbar("errors.error", "error", t);
      });
  };

  const fetchSocialFridges = async (
    page: number,
    isFiltering: boolean,
    filters: String[]
  ) => {
    const newPage = page + 1;

    await fetchWithAuthorization(
      `/api/social-fridge/managed-social-fridges?states=${filters}&page=${page}&size=${itemsPerPage}`,
      HTTP_GET
    )
      .then((response) => {
        if (response.status === HTTP_UNAUTHORIZED) {
          snackbar("errors.unauthorized", "error", t);
          router.push("/login");
        }
        return response.json();
      })
      .then((data) => {
        if (data.fridges.length > 0 && !isFiltering) {
          setSocialFridges([...socialFridges, ...data.fridges]);
          setNextPage(newPage);
          if (data.fridges.length < itemsPerPage) {
            setHasMore(false);
          }
        } else if (isFiltering) {
          setSocialFridges(data.fridges);
          setNextPage(newPage);
          if (data.fridges.length < itemsPerPage) {
            setHasMore(false);
          }
        } else {
          setHasMore(false);
        }
      })
      .catch((error) => {
        snackbar("errors.managed_fridge_error", "error", t);
      });
    setLoadingState(false);
    setOpenFilter(false);
  };

  useEffect(() => {
    fetchSocialFridges(nextPage, false, viewFilters);
    getUserLocation(t).then((location) => {
      setUserLocation(location);
    });
  }, []);

  const sortFridges = (
    socialFridges: SocialFridge[],
    ascendingOrder: boolean
  ) => {
    return sortByStreet(socialFridges, ascendingOrder);
  };

  const socialFridgeListOrder = useMemo(() => {
    return sortFridges(socialFridges, ascendingOrder);
  }, [socialFridges, ascendingOrder]);

  const toggleSortingOrder = () => {
    setAscendingOrder(!ascendingOrder);
  };

  const handleViewFilterChange = (value: string) => {
    const updatedFilters = [...viewFilters];
    const index = updatedFilters.indexOf(value);

    if (viewFilters.includes(value) && viewFilters.length > 1) {
      updatedFilters.splice(index, 1);
      setViewFilters(updatedFilters);

      setHasMore(true);
      fetchSocialFridges(0, true, updatedFilters);
    } else if (!viewFilters.includes(value)) {
      updatedFilters.push(value);
      setViewFilters(updatedFilters);

      setHasMore(true);
      fetchSocialFridges(0, true, updatedFilters);
    }
  };

  const handleFilterClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
    setOpenFilter(true);
  };

  const handleCloseFilter = () => {
    setOpenFilter(false);
  };

  const handleAddFridge = async () => {
    await fetchManagersData();
    setCurrentDialog(DialogType.AddFridge);
  };

  const handleRefresh = () => {
    setHasMore(true);
    setNextPage(0);

    fetchSocialFridges(0, true, viewFilters);
  };

  return (
    <div>
      <LoadingSpinner open={loadingState} />
      {!loadingState && (
        <Container component="main" maxWidth="xl">
          <div>
            <IconButton onClick={handleFilterClick}>
              <FilterListIcon />
            </IconButton>

            <IconButton onClick={toggleSortingOrder}>
              <SortByAlphaIcon />
            </IconButton>

            <IconButton onClick={handleRefresh}>
              <CachedIcon />
            </IconButton>
            <Button
              onClick={handleAddFridge}
              style={{ color: secondary, marginLeft: "30px" }}
            >
              {t("managedSocialFridge.messages.addFridge")}
            </Button>
          </div>
          <Popover
            open={openFilter}
            onClose={handleCloseFilter}
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "left",
            }}
          >
            <Box p={2}>
              <Box display="block">
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={viewFilters.includes(ARCHIVED)}
                      onChange={() => handleViewFilterChange(ARCHIVED)}
                      value="archived"
                      style={{ color: secondary }}
                    />
                  }
                  label={t("managedSocialFridge.messages.archivedFridge")}
                />
              </Box>
              <Box display="block">
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={viewFilters.includes(ACTIVE)}
                      onChange={() => handleViewFilterChange(ACTIVE)}
                      value="active"
                      style={{ color: secondary }}
                    />
                  }
                  label={t("managedSocialFridge.messages.activeFridge")}
                />
              </Box>
              <Box display="block">
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={viewFilters.includes(INACTIVE)}
                      onChange={() => handleViewFilterChange(INACTIVE)}
                      value="unactive"
                      style={{ color: secondary }}
                    />
                  }
                  label={t("managedSocialFridge.messages.unactiveFridge")}
                />
              </Box>
            </Box>
          </Popover>

          <InfiniteScroll
            dataLength={socialFridges.length}
            next={() => fetchSocialFridges(nextPage, false, viewFilters)}
            hasMore={hasMore}
            loader={
              <h4 style={{ textAlign: "center" }}>
                {t("infiniteScroll.loading")}
              </h4>
            }
            endMessage={
              <p style={{ textAlign: "center" }}>
                <b>{t("infiniteScroll.end")}</b>
              </p>
            }
          >
            <Box sx={{ width: "100%" }}>
              <List>
                {socialFridges?.map((socialFridge, index) => (
                  <ListItem key={index}>
                    <ListItemAvatar>
                      <Avatar>
                        <KitchenIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ManagedSocialFridge socialFridge={socialFridge} t={t} />
                  </ListItem>
                ))}
              </List>
            </Box>
          </InfiniteScroll>

          <AddFridge
            isOpen={currentDialog === DialogType.AddFridge}
            onClose={() => setCurrentDialog(DialogType.None)}
            t={t}
            userLocation={userLocation}
            managers={managers}
          />
        </Container>
      )}
    </div>
  );
};

export default ManagedSocialFridges;
