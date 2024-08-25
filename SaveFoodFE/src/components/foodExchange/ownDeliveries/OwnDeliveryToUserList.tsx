import { Grid, Grow, useTheme } from "@mui/material";
import React, { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import InfiniteScroll from "react-infinite-scroll-component";
import { UserContext } from "../../../components/context/UserContextProvider";
import { foodExchangeDictionary } from "../../../constants/dictionary";
import { HTTP_GET } from "../../../constants/httpMethods";
import { foodExchangeUrl } from "../../../constants/url/foodExchange";
import { DeliveryToUser } from "../../../type/mzwz";
import fetchWithAuthorization from "../../../utils/axios/fetchWrapper";
import LoadingState from "../../../utils/loading_spinner/LoadingSpinner";
import { paginationSizeList } from "../../../utils/pagination/PaginatinSizeList";
import EndMessage from "../infinityScroll/EndMessage";
import OwnDeliveryToUserCard from "./OwnDeliveryToUserCard";

function OwnDeliveryToUserList() {
  const [deliveriesToUser, setDeliveriesToUser] = useState<DeliveryToUser[]>(
    []
  );
  const translation = "Tabs.AllDeliveries.InfinityScroll.";
  const { t } = useTranslation(foodExchangeDictionary);
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const { usernameAccount } = useContext(UserContext);
  const [hasMore, setHasMore] = useState(true);
  const [noItems, setNoItems] = useState(false);
  const itemsPerPage = paginationSizeList();
  const [page, setPage] = useState(0);
  const [isDialogDetailsExchangeOpen, setIsDialogDetailsExchangeOpen] =
    useState(false);

  useEffect(() => {
    fetchDeliveries();
  }, []);

  const [animatedIndex, setAnimatedIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimatedIndex((prevIndex) =>
        prevIndex < deliveriesToUser.length - 1 ? prevIndex + 1 : prevIndex
      );
    }, 200 * animatedIndex);

    return () => clearInterval(interval);
  }, [deliveriesToUser]);

  const fetchDeliveries = async () => {
    const queryParams = new URLSearchParams();
    queryParams.append("accountUsername", usernameAccount);
    queryParams.append("size", String(itemsPerPage));
    queryParams.append("page", String(page));
    setPage((prev) => prev + 1);

    await fetchWithAuthorization(
      `${foodExchangeUrl}deliveryToUser?${queryParams.toString()}`,
      HTTP_GET
    )
      .then((res) => {
        res.json().then((resAxios) => {
          setDeliveriesToUser([
            ...deliveriesToUser,
            ...resAxios.deliveriesToUser,
          ]);
          if (resAxios.deliveriesToUser.length < itemsPerPage) {
            setHasMore(false);
            if (resAxios.deliveriesToUser.length === 0) {
              setNoItems(true);
            }
          }
          setLoading(false);
        });
      })
      .catch((error) => {
        return;
      });
  };

  const handleDetailsExchangeDialog = () => {
    setIsDialogDetailsExchangeOpen((prev) => !prev);
  };

  const removeDeliveryFromList = (event: React.FormEvent, index: number) => {
    setDeliveriesToUser((prev) => {
      if (prev.length === 1 || prev.length === 0) {
        setNoItems(true);
      }
      prev.splice(index, 1);
      return [...prev];
    });
  };

  return (
    <InfiniteScroll
      dataLength={deliveriesToUser.length}
      next={fetchDeliveries}
      hasMore={hasMore}
      loader={<LoadingState open={true} />}
      endMessage={
        <EndMessage
          noItems={noItems}
          loading={loading}
          noItemsMessage={t(translation + "noItems")}
          noMoreProducts={t(translation + "noMoreProducts")}
        />
      }
    >
      <Grid container spacing={0.5}>
        {deliveriesToUser.map((deliveryToUser, index) => (
          <Grow
            key={deliveryToUser.id}
            timeout={500}
            in={index <= animatedIndex}
          >
            <Grid
              item
              xs={12}
              sm={12}
              md={6}
              lg={4}
              xl={3}
              key={deliveryToUser.id}
            >
              <OwnDeliveryToUserCard
                deliveryToUser={deliveryToUser}
                index={index}
                key={deliveryToUser.id}
                removeDeliveryFromList={removeDeliveryFromList}
              />
            </Grid>
          </Grow>
        ))}
      </Grid>
    </InfiniteScroll>
  );
}

export default OwnDeliveryToUserList;
