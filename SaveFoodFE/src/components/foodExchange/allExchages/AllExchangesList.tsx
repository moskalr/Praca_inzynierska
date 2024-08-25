import { Grid, Grow, useTheme } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import InfiniteScroll from "react-infinite-scroll-component";
import { foodExchangeDictionary } from "../../../constants/dictionary";
import { HTTP_GET } from "../../../constants/httpMethods";
import { foodExchangeUrl } from "../../../constants/url/foodExchange";
import { Exchange } from "../../../type/mzwz";
import fetchWithAuthorization from "../../../utils/axios/fetchWrapper";
import LoadingState from "../../../utils/loading_spinner/LoadingSpinner";
import { paginationSizeList } from "../../../utils/pagination/PaginatinSizeList";
import snackbarTranslated from "../../../utils/snackbar/snackbarTranslated";
import EndMessage from "../infinityScroll/EndMessage";
import AllExchangeCard from "./AllExchangeCard";

const translation = "Tabs.AllExchanges.InfinityScroll.";

export function AllExchangeList() {
  const [exchanges, setExchanges] = useState<Exchange[]>([]);
  const theme = useTheme();
  const { t } = useTranslation(foodExchangeDictionary);
  const itemsPerPage = paginationSizeList();
  const [hasMore, setHasMore] = useState(true);
  const [noItems, setNoItems] = useState(false);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchExchanges();
  }, []);

  const fetchExchanges = async () => {
    const queryParams = new URLSearchParams();
    queryParams.append("size", String(itemsPerPage));
    queryParams.append("page", String(page));
    setPage((prev) => prev + 1);

    await fetchWithAuthorization(
      `${foodExchangeUrl}exchanges?${queryParams.toString()}`,
      HTTP_GET
    )
      .then((res) => {
        res
          .json()
          .then((resAxios) => {
            setExchanges([...exchanges, ...resAxios.exchanges]);
            if (resAxios.exchanges.length < itemsPerPage) {
              setHasMore(false);
              if (resAxios.exchanges.length === 0 && page === 0) {
                setNoItems(true);
              }
            }
          })
          .catch((error) => {
            setHasMore(false);
            snackbarTranslated(t("noItemsFris.end"), "error");
          });
      })
      .catch((error) => {
        snackbarTranslated(t("noItemsSec.end"), "error");
      });
  };

  const removeExchangeFromList = (event: React.FormEvent, index: number) => {
    setExchanges((prev) => {
      prev.splice(index, 1);
      if (prev.length === 1 || prev.length === 0) {
        setNoItems(true);
      }
      return [...prev];
    });
  };

  const [animatedIndex, setAnimatedIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimatedIndex((prevIndex) =>
        prevIndex < exchanges.length - 1 ? prevIndex + 1 : prevIndex
      );
    }, 200 * animatedIndex);

    return () => clearInterval(interval);
  }, [exchanges]);

  return (
    <InfiniteScroll
      dataLength={exchanges.length}
      next={fetchExchanges}
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
        {exchanges.map((exchange, index) => (
          <Grow key={exchange.id} timeout={500} in={index <= animatedIndex}>
            <Grid item xs={12} sm={12} md={6} lg={4} xl={3} key={exchange.id}>
              <AllExchangeCard
                exchange={exchange}
                index={index}
                key={exchange.id}
                removeExchangeFromList={removeExchangeFromList}
              />
            </Grid>
          </Grow>
        ))}
      </Grid>
    </InfiniteScroll>
  );
}

export default AllExchangeList;
