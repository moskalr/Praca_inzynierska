import DeleteIcon from "@mui/icons-material/Delete";
import { Box, IconButton, List, ListItem } from "@mui/material";
import Avatar from "@mui/material/Avatar";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import Image from "next/image";
import router from "next/router";
import React from "react";
import { HTTP_UNAUTHORIZED } from "../../constants/httpCodes";
import { HTTP_PATCH } from "../../constants/httpMethods";
import styles from "../../styles/favorities.module.css";
import fetchWithAuthorization from "../../utils/axios/fetchWrapper";
import { Categories } from "../../utils/categories/categories";
import snackbar from "../../utils/snackbar/snackbar";
import FoodBag from "/public/icons/food-bag.png";

interface FavCategoriesProps {
  categories: Categories[];
  t: Function;
  updateCategories: (newCategories: Categories[]) => void;
  eTag?: string;
}

const FavCategories: React.FC<FavCategoriesProps> = ({
  categories,
  t,
  updateCategories,
  eTag,
}) => {
  const handleDeleteClick = async (categoryToDelete: Categories) => {
    const filteredCategories = categories.filter(
      (category) => category !== categoryToDelete
    );

    const requestOptions = {
      body: JSON.stringify({
        categories: filteredCategories,
        socialFridges: [],
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
            snackbar("preferences.successes.category_success", "success", t);
            updateCategories(data.preferences.favCategories);
          } else if (data.error.key !== undefined) {
            snackbar(`errors.${data.error.key}`, "error", t);
          }
        });
      })
      .catch(() => {
        snackbar("errors.category_error", "error", t);
      });
  };

  return (
    <Box className={styles["box"]}>
      <List>
        {categories.length === 0 && (
          <p className={styles["header"]}>
            {t("preferences.messages.no_favorite_categories")}
          </p>
        )}
        {categories.length > 0 &&
          categories.map((category, index) => (
            <ListItem key={index}>
              <ListItemAvatar>
                <div style={{ cursor: "pointer", marginRight: "16px" }}>
                  <Avatar>
                    <Image
                      src={FoodBag}
                      alt="Open fridge"
                      layout="fixed"
                      width={30}
                      height={30}
                    />
                  </Avatar>
                </div>
              </ListItemAvatar>
              <div className={styles["list-item"]}>
                <div className={styles["list-item-content"]}>
                  <p className={styles["p"]}>
                    {t("preferences.details.category")}
                    {t(`categories.${category}`)}
                  </p>
                  <IconButton onClick={() => handleDeleteClick(category)}>
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

export default FavCategories;
