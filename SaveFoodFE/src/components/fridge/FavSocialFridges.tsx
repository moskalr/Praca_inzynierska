import DeleteIcon from "@mui/icons-material/Delete";
import KitchenIcon from "@mui/icons-material/Kitchen";
import { Box, IconButton, List, ListItem } from "@mui/material";
import Avatar from "@mui/material/Avatar";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import { useRouter } from "next/router";
import React from "react";
import {
  listBackgroundIsActive,
  listBackgroundIsArchive,
  listBackgroundIsInactive,
} from "../../constants/colors";
import { HTTP_UNAUTHORIZED } from "../../constants/httpCodes";
import { HTTP_PATCH } from "../../constants/httpMethods";
import { ARCHIVED, INACTIVE } from "../../constants/socialFridgeStates";
import styles from "../../styles/favorities.module.css";
import { SocialFridge } from "../../type/mzls";
import fetchWithAuthorization from "../../utils/axios/fetchWrapper";
import { Categories } from "../../utils/categories/categories";
import snackbar from "../../utils/snackbar/snackbar";

interface FavSocialFridgesProps {
  socialFridges: SocialFridge[];
  categories: Categories[];
  t: Function;
  updateSocialFridges: (newCategories: SocialFridge[]) => void;
  eTag?: string;
}

const FavSocialFridges: React.FC<FavSocialFridgesProps> = ({
  socialFridges,
  categories,
  t,
  updateSocialFridges,
  eTag,
}) => {
  const router = useRouter();

  const handleDeleteClick = async (socialFridge: SocialFridge) => {
    const requestOptions = {
      body: JSON.stringify({
        socialFridges: [socialFridge.id],
        categories: categories,
      }),
      headers: {
        "If-Match": eTag,
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
            snackbar("preferences.successes.fridge_success", "success", t);
            updateSocialFridges(data.preferences.favSocialFridges);
          } else if (data.error.key !== undefined) {
            snackbar(`errors.${data.error.key}`, "error", t);
          }
        });
      })
      .catch(() => {
        snackbar("errors.fridge_error", "error", t);
      });
  };

  const handleAvatarClick = (socialFridgeId: number) => {
    router.push(`/fridge/${socialFridgeId}`);
  };

  const socialFridgeColor = (state: string) => {
    let borderColor = listBackgroundIsActive;
    if (state === ARCHIVED) {
      borderColor = listBackgroundIsArchive;
    } else if (state === INACTIVE) {
      borderColor = listBackgroundIsInactive;
    }
    return borderColor;
  };

  return (
    <Box className={styles["box"]}>
      <List>
        {socialFridges.length === 0 && (
          <p className={styles["header"]}>
            {t("preferences.messages.no_favorite_social_fridges")}
          </p>
        )}
        {socialFridges.length > 0 &&
          socialFridges &&
          socialFridges.map((socialFridge, index) => (
            <ListItem key={index}>
              <ListItemAvatar>
                <div
                  onClick={() => {
                    handleAvatarClick(socialFridge.id);
                  }}
                  className={styles["avatar-container"]}
                >
                  <Avatar>
                    <KitchenIcon />
                  </Avatar>
                </div>
              </ListItemAvatar>
              <div className={styles["list-item"]}>
                <div
                  style={{
                    border: `2px solid ${socialFridgeColor(
                      socialFridge.state
                    )}`,
                  }}
                  className={styles["list-item-content"]}
                >
                  <p className={styles["p"]}>
                    {t("preferences.details.address")}
                    {socialFridge.address.street},
                    {socialFridge.address.buildingNumber},
                    {socialFridge.address.city},{" "}
                    {socialFridge.address.postalCode}
                  </p>
                  <IconButton onClick={() => handleDeleteClick(socialFridge)}>
                    <DeleteIcon />
                  </IconButton>
                </div>
              </div>
            </ListItem>
          ))}
      </List>
    </Box>
  );
};

export default FavSocialFridges;
