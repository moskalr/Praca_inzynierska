import AddIcon from "@mui/icons-material/Add";
import CachedIcon from "@mui/icons-material/Cached";
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  Paper,
} from "@mui/material";
import router from "next/router";
import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { secondary } from "../../constants/colors";
import { HTTP_OK, HTTP_UNAUTHORIZED } from "../../constants/httpCodes";
import { HTTP_GET, HTTP_PATCH } from "../../constants/httpMethods";
import { ACTIVE, INACTIVE } from "../../constants/socialFridgeStates";
import styles from "../../styles/favorities.module.css";
import { SocialFridge } from "../../type/mzls";
import fetchWithAuthorization from "../../utils/axios/fetchWrapper";
import { Categories } from "../../utils/categories/categories";
import LoadingState from "../../utils/loading_spinner/LoadingSpinner";
import snackbar from "../../utils/snackbar/snackbar";
import CategorySelect from "./CategorySelect";
import FavCategories from "./FavCategories";
import FavSocialFridges from "./FavSocialFridges";
import FridgeSelect from "./FridgeSelect";

interface FavCategoriesFridgesProps {
  t: Function;
}

type TFormValues = {
  categories: Categories[];
  fridges: SocialFridge[];
};

const FavCategoriesFridges: React.FC<FavCategoriesFridgesProps> = ({ t }) => {
  const [socialFridges, setSocialFridges] = useState<SocialFridge[]>([]);
  const [preferencesCategories, setPreferencesCategories] =
    useState<Categories[]>();
  const [preferencesFridges, setPreferencesFridges] =
    useState<SocialFridge[]>();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loadingState, setLoadingState] = useState(true);
  const [accountETag, setAccountETag] = useState();
  const defaultValues: TFormValues = {
    categories: [],
    fridges: [],
  };

  const { handleSubmit, control, watch, reset } = useForm({
    defaultValues: defaultValues,
  });
  const availableCategories = Object.values(Categories).filter(
    (category) => !preferencesCategories?.includes(category)
  );
  const availableFridges = socialFridges.filter(
    (fridge) =>
      !preferencesFridges?.find((favFridge) => favFridge.id === fridge.id)
  );

  const fetchData = async () => {
    try {
      const states = [INACTIVE, ACTIVE];
      const [fridgesResponse, preferencesResponse] = await Promise.all([
        fetchWithAuthorization(
          `/api/social-fridge/fridges?states=${states}`,
          HTTP_GET
        ),
        fetchWithAuthorization("/api/social-fridge/preferences", HTTP_GET),
      ]);

      if (fridgesResponse.status === HTTP_OK) {
        const fridgesData = await fridgesResponse.json();
        setSocialFridges(fridgesData.fridges);
      } else if (fridgesResponse.status === HTTP_UNAUTHORIZED) {
        snackbar("errors.unauthorized", "error", t);
        router.push("/login");
      } else {
        snackbar("errors.preferences_error", "error", t);
      }

      if (preferencesResponse.status === HTTP_OK) {
        const preferencesData = await preferencesResponse.json();
        setPreferencesCategories(preferencesData.preferences.favCategories);
        setPreferencesFridges(preferencesData.preferences.favSocialFridges);
        setAccountETag(preferencesData.eTag);
      } else if (preferencesResponse.status === HTTP_UNAUTHORIZED) {
        snackbar("errors.unauthorized", "error", t);
        router.push("/login");
      } else {
        setLoadingState(false);
        snackbar("errors.preferences_error", "error", t);
      }
    } catch (error) {
      setLoadingState(false);
      snackbar("errors.preferences_error", "error", t);
    }
    setLoadingState(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddPreferences = async () => {
    const { categories, fridges } = watch();
    const updatedCategories = [...categories];

    if (preferencesCategories) {
      updatedCategories.push(...preferencesCategories);
    }

    const requestOptions = {
      body: JSON.stringify({
        categories: updatedCategories,
        socialFridges: fridges,
      }),
      headers: {
        "If-Match": accountETag,
      },
    };

    await fetchWithAuthorization(
      `/api/social-fridge/preferences`,
      HTTP_PATCH,
      requestOptions
    )
      .then((response) => {
        if (response.status === HTTP_UNAUTHORIZED) {
          snackbar("errors.unauthorized", "error", t);
          router.push("/login");
        }
        return response.json().then((data) => {
          if (response.ok) {
            snackbar("preferences.successes.category_success", "success", t);
            setPreferencesCategories(data.preferences.favCategories);
            setPreferencesFridges(data.preferences.favSocialFridges);
          } else if (data.error.key !== undefined) {
            snackbar(`errors.${data.error.key}`, "error", t);
          }
        });
      })
      .catch(() => {
        snackbar("errors.fav_categories_fridge_update_error", "error", t);
      });
    setIsDialogOpen(false);
    reset(defaultValues);
  };

  const handleUpdateFavCategories = (newFavCategories: Categories[]) => {
    setPreferencesCategories(newFavCategories);
  };

  const handleUpdateFavSocialFridges = (
    newFavSocialFridges: SocialFridge[]
  ) => {
    setPreferencesFridges(newFavSocialFridges);
  };

  const handleRefresh = () => {
    fetchData();
  };

  return (
    <Box display="flex" flexDirection="column" flexGrow={1} height="100%">
      <LoadingState open={loadingState} />
      {!loadingState && preferencesCategories && preferencesFridges && (
        <Paper className={styles["container"]}>
          <Box className={styles["header"]}>
            <span>{t("preferences.messages.favorite_social_fridges")}</span>
            <div>
              <IconButton onClick={handleRefresh}>
                <CachedIcon />
              </IconButton>
              <IconButton onClick={() => setIsDialogOpen(true)}>
                <AddIcon />
              </IconButton>
            </div>
          </Box>
          <Box className={styles["box"]}>
            <FavSocialFridges
              socialFridges={preferencesFridges}
              categories={preferencesCategories}
              t={t}
              updateSocialFridges={handleUpdateFavSocialFridges}
              eTag={accountETag}
            />
          </Box>
          <Box className={styles["dialog-header"]}>
            <span>{t("preferences.messages.favorite_categories")}</span>
            <FavCategories
              categories={preferencesCategories}
              t={t}
              updateCategories={handleUpdateFavCategories}
              eTag={accountETag}
            />
          </Box>

          <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)}>
            <DialogTitle>
              {t("preferences.dialogs.update_preferences_title")}
            </DialogTitle>
            <DialogContent>
              <FormControl
                className={styles["box"]}
                style={{ marginTop: "10px" }}
              >
                <Controller
                  name="categories"
                  control={control}
                  render={({ field, fieldState }) => (
                    <CategorySelect
                      field={field}
                      fieldState={fieldState}
                      availableCategories={availableCategories}
                      t={t}
                    />
                  )}
                />
              </FormControl>
              <FormControl className={styles["fridges-select"]}>
                <Controller
                  name="fridges"
                  control={control}
                  render={({ field, fieldState }) => (
                    <FridgeSelect
                      field={field}
                      fieldState={fieldState}
                      availableFridges={availableFridges}
                      t={t}
                    />
                  )}
                />
              </FormControl>
              <Button
                onClick={() => setIsDialogOpen(false)}
                style={{
                  color: secondary,
                }}
                className={styles["button"]}
              >
                {t("preferences.dialogs.cancel_button")}
              </Button>
              <Button
                onClick={handleAddPreferences}
                style={{
                  color: secondary,
                }}
                className={styles["button"]}
              >
                {t("preferences.dialogs.update_button")}
              </Button>
            </DialogContent>
          </Dialog>
        </Paper>
      )}
    </Box>
  );
};

export default FavCategoriesFridges;
