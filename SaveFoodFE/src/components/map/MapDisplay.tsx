import CachedIcon from "@mui/icons-material/Cached";
import SearchIcon from "@mui/icons-material/Search";
import {
  Box,
  Button,
  IconButton,
  InputAdornment,
  TextField,
} from "@mui/material";
import dynamic from "next/dynamic";
import router from "next/router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { secondary } from "../../constants/colors";
import { HTTP_OK, HTTP_UNAUTHORIZED } from "../../constants/httpCodes";
import { HTTP_GET } from "../../constants/httpMethods";
import { ACTIVE, INACTIVE } from "../../constants/socialFridgeStates";
import styles from "../../styles/tabs_map.module.css";
import { LatLng, SocialFridge } from "../../type/mzls";
import fetchWithAuthorization from "../../utils/axios/fetchWrapper";
import LoadingState from "../../utils/loading_spinner/LoadingSpinner";
import { getUserLocation } from "../../utils/location/location";
import snackbar from "../../utils/snackbar/snackbar";
import { HomePageValidation } from "../../utils/validation/HomePageValidation";

interface MapProps {
  t: Function;
}

const MapDisplay: React.FC<MapProps> = ({ t }) => {
  const [userLocation, setUserLocation] = useState<LatLng>();
  const [socialFridges, setSocialFridges] = useState<SocialFridge[]>([]);
  const [loadingState, setLoadingState] = useState(true);
  const validationRules = HomePageValidation(t);

  const DynamicMap = dynamic(() => import("../../components/map/Map"), {
    ssr: false,
  });

  const {
    register,
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    fetchSocialFridges();
    getUserLocation(t).then((location) => {
      setUserLocation(location);
    });
  }, []);

  const fetchSocialFridges = async () => {
    const states = [INACTIVE, ACTIVE];
    await fetchWithAuthorization(
      `/api/social-fridge/fridges?states=${states}`,
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
        setSocialFridges(data.fridges);
        setLoadingState(false);
      })
      .catch((error) => {
        snackbar("error", "error", t);
        setLoadingState(false);
      });
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
            <form onSubmit={handleSubmit(handleSearchClick)}>
              <div
                style={{
                  padding: "16px",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <TextField
                  type="number"
                  label={t("landing_page.distance")}
                  variant="outlined"
                  {...register("distance", validationRules.distance)}
                  error={!!errors.distance}
                  helperText={errors?.distance?.message as string || ""}
                  InputLabelProps={{
                    style: { color: secondary },
                  }}
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
                  style={{
                    color: secondary,
                    marginLeft: "8px",
                    maxWidth: "12px",
                  }}
                  onClick={handleSearchClick}
                >
                  {t("landing_page.search")}
                </Button>

                <IconButton
                  type="submit"
                  sx={{ p: "10px" }}
                  aria-label="refresh"
                >
                  <CachedIcon />
                </IconButton>
              </div>
            </form>
          </div>
          <div className={styles["map-container"]}>
            <div className={styles["rounded-map"]}>
              <DynamicMap
                userLocation={userLocation}
                socialFridges={socialFridges}
                mapLabel={t("grade")}
              />
            </div>
          </div>
        </div>
      )}
    </Box>
  );
};

export default MapDisplay;