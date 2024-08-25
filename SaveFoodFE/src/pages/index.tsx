import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import FilterListIcon from "@mui/icons-material/FilterList";
import SearchIcon from "@mui/icons-material/Search";
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  FormControl,
  InputAdornment,
  InputLabel,
  MenuItem,
  Popover,
  Select,
  TextField,
} from "@mui/material";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import Map from "../components/map";
import { secondary } from "../constants/colors";
import { HTTP_OK } from "../constants/httpCodes";
import { HTTP_GET } from "../constants/httpMethods";
import { ACTIVE, INACTIVE } from "../constants/socialFridgeStates";
import { foodExchangeUrl } from "../constants/url/foodExchange";
import { LatLng, SocialFridge } from "../type/mzls";
import { EventMZWO } from "../type/mzwo";
import { Product } from "../type/mzwz";
import fetchWithAuthorization from "../utils/axios/fetchWrapper";
import snackbarTranslated from "../utils/snackbar/snackbarTranslated";
import { HomePageValidation } from "../utils/validation/HomePageValidation";
import styles from "../styles/landing_page.module.css";
import LoadingState from "../utils/loading_spinner/LoadingSpinner";
import { getUserLocation } from "../utils/location/location";
import snackbar from "../utils/snackbar/snackbar";

const dictionary = "landing_page";

export function Home() {
  const { t } = useTranslation(dictionary);
  const [userLocation, setUserLocation] = useState<LatLng>();
  const [socialFridges, setSocialFridges] = useState<SocialFridge[]>([]);
  const [events, setEvents] = useState<EventMZWO[]>([]);
  const [selectedFilter, setSelectedFilter] = useState("");
  const [anchorEl, setAnchorEl] = useState<null | HTMLAnchorElement>(null);
  const [openFilterDialog, setOpenFilterDialog] = useState(false);
  const validationRules = HomePageValidation(t);
  const [loadingState, setLoadingState] = useState(true);
  const isFilterPopoverOpen = Boolean(anchorEl);
  const filterPopoverId = isFilterPopoverOpen ? "filter-popover" : undefined;
  const isFridgesFilterSelected =
    selectedFilter === "" || selectedFilter === "fridges";
  const isProductsFilterSelected =
    selectedFilter === "" || selectedFilter === "products";
  const isEventsFilterSelected =
    selectedFilter === "" || selectedFilter === "events";

  const [products, setProducts] = useState<Product[]>([]);
  const {
    register,
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    fetchSocialFridges();
    fetchProducts();
    fetchEvents();
    getUserLocation(t).then((location) => {
      setUserLocation(location);
    });
  }, []);

  const fetchProducts = async () => {
    // await fetchWithAuthorization(`${foodExchangeUrl}product/products`, HTTP_GET)
    //   .then((res) => {
    //     res
    //       .json()
    //       .then((resAxios) => {
    //         setProducts([...products, ...resAxios.products]);
    //       })
    //       .catch((error) => {
    //         snackbarTranslated(t("noItemsFris.end"), "error");
    //       });
    //   })
    //   .catch((error) => {
    //     snackbarTranslated(t("noItemsSec.end"), "error");
    //   });
  };

  const fetchSocialFridges = async () => {
    const states = [INACTIVE, ACTIVE];
    await fetchWithAuthorization(
      `/api/social-fridge/fridges?states=${states}`,
      HTTP_GET
    )
      .then((response) => response.json())
      .then((data) => {
        setSocialFridges(data.fridges);
        setLoadingState(false);
      })
      .catch((error) => {
        snackbar("error", "error", t);
        setLoadingState(false);
      });
  };

  const fetchEvents = async () => {
    // try {
    //   const response = await fetchWithAuthorization(
    //     `/api/events-announcements/events/events`,
    //     HTTP_GET
    //   );
    //   const data = await response.json();
    //   if (response.ok) {
    //     setEvents(data.events);
    //   }
    // } catch (error) {
    //   snackbar("snackbar.errorMessage.default", "error", t);
    // }
  };

  const fetchNearestSocialFridges = async (distance: number) => {
    const latitude = userLocation?.lat;
    const longitude = userLocation?.lng;

    const url = `/api/social-fridge/nearestSocialFridges?latitude=${latitude}&longitude=${longitude}&maxDistance=${distance}`;

    fetchWithAuthorization(url, HTTP_GET)
      .then((response) => {
        if (response.status === HTTP_OK) {
          return response.json();
        }
      })
      .then((data) => {
        setSocialFridges(data.fridges);
        if (data.fridges.length === 0) {
          snackbar("landing_page.area_success", "success", t);
        }
      })
      .catch((error) => {
        snackbar("landing_page.area_error", "error", t);
      });
  };

  const handleFilterChange = (value: string) => {
    setSelectedFilter(value);
  };

  const handleClickFilterIcon = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget as HTMLAnchorElement | null);
  };

  const handleCloseFilter = () => {
    setAnchorEl(null);
  };

  const handleSearchClick = () => {
    const distance = watch("distance");
    if (distance !== "") {
      fetchNearestSocialFridges(distance);
    } else {
      fetchSocialFridges();
    }
  };

  return (
    <Box display="flex" flexDirection="column" flexGrow={1} height="100%">
      <LoadingState open={loadingState} />
      {!loadingState && (
        <div>
          <div className="navbar">
            <div className={styles["filter-dropdown"]}>
              <FormControl
                variant="outlined"
                className={styles["custom-select"]}
              >
                <InputLabel style={{ color: secondary }}>
                  {t("landing_page.search")}
                </InputLabel>
                <Select
                  value={selectedFilter}
                  onChange={(e) => handleFilterChange(e.target.value)}
                  label={t("landing_page.search")}
                  IconComponent={ArrowDropDownIcon}
                  MenuProps={{
                    anchorOrigin: { vertical: "bottom", horizontal: "left" },
                  }}
                >
                  <MenuItem value="">
                    <em>{t("landing_page.select")}</em>
                  </MenuItem>
                  <MenuItem value="fridges">
                    {t("landing_page.fridges")}
                  </MenuItem>
                  <MenuItem value="events">{t("landing_page.events")}</MenuItem>
                  <MenuItem value="products">
                    {t("landing_page.products")}
                  </MenuItem>
                </Select>
              </FormControl>

              {isFridgesFilterSelected && (
                <div
                  style={{ right: "2vw", position: "fixed" }}
                  onClick={handleClickFilterIcon}
                >
                  <FilterListIcon />
                </div>
              )}
            </div>
            <Popover
              id={filterPopoverId}
              open={isFilterPopoverOpen}
              anchorEl={anchorEl}
              onClose={handleCloseFilter}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "right",
              }}
            >
              <form onSubmit={handleSubmit(handleSearchClick)}>
                <div style={{ padding: "16px" }}>
                  <TextField
                    type="number"
                    label={t("landing_page.distance")}
                    InputLabelProps={{
                      style: { color: secondary },
                    }}
                    variant="outlined"
                    fullWidth
                    {...register("distance", validationRules.distance)}
                    error={!!errors.distance}
                    helperText={errors.distance?.message?.toString()}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <Button
                    variant="contained"
                    type="submit"
                    fullWidth
                    style={{ color: secondary, marginTop: "14px" }}
                    onClick={handleSearchClick}
                  >
                    {t("landing_page.search")}
                  </Button>
                </div>
              </form>
            </Popover>
          </div>
          <div className={styles["map-container"]}>
            <Dialog
              open={openFilterDialog}
              onClose={() => setOpenFilterDialog(false)}
            >
              <DialogTitle>{t("landing_page.filters_title")}</DialogTitle>
            </Dialog>
            <div className={styles["rounded-map"]}>
              <Map
                userLocation={userLocation}
                socialFridges={isFridgesFilterSelected ? socialFridges : []}
                events={isEventsFilterSelected ? events : []}
                products={isProductsFilterSelected ? products : []}
                mapLabel={t("grade")}
              />
            </div>
          </div>
        </div>
      )}
    </Box>
  );
}

export async function getStaticProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, [dictionary, "navbar"])),
    },
  };
}

export default Home;
