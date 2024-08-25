import { Grid, Grow } from "@mui/material";
import React, { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import InfiniteScroll from "react-infinite-scroll-component";
import { UserContext } from "../../../components/context/UserContextProvider";
import { foodExchangeDictionary } from "../../../constants/dictionary";
import { HTTP_GET } from "../../../constants/httpMethods";
import { foodExchangeUrl } from "../../../constants/url/foodExchange";
import { Exchange } from "../../../type/mzwz";
import fetchWithAuthorization from "../../../utils/axios/fetchWrapper";
import LoadingState from "../../../utils/loading_spinner/LoadingSpinner";
import { paginationSizeList } from "../../../utils/pagination/PaginatinSizeList";
import EndMessage from "../infinityScroll/EndMessage";
import ExchangeCard from "./ExchangeCard";

export function ExchangeList() {
  const [exchanges, setExchanges] = useState<Exchange[]>([]);
  const [tabValue, setTabValue] = useState(0);
  const [hydrated, setHydrated] = useState(false);
  const { t } = useTranslation(foodExchangeDictionary);
  const { usernameAccount } = useContext(UserContext);
  const itemsPerPage = paginationSizeList();
  const [hasMore, setHasMore] = useState(true);
  const [noItems, setNoItems] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const translation = "Tabs.AllExchanges.InfinityScroll.";
  const [page, setPage] = useState(0);

  useEffect(() => {
    fetchExchanges();
  }, []);

  const [animatedIndex, setAnimatedIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimatedIndex((prevIndex) =>
        prevIndex < exchanges.length - 1 ? prevIndex + 1 : prevIndex
      );
    }, 1500 * animatedIndex);

    return () => clearInterval(interval);
  }, [exchanges]);

  const fetchExchanges = async () => {
    const queryParams = new URLSearchParams();
    queryParams.append("accountUsername", usernameAccount);
    queryParams.append("size", String(itemsPerPage));
    queryParams.append("page", String(page));
    setPage((prev) => prev + 1);

    await fetchWithAuthorization(
      `${foodExchangeUrl}exchanges?${queryParams.toString()}`,
      HTTP_GET
    )
      .then((res) => {
        res.json().then((resAxios) => {
          setExchanges([...exchanges, ...resAxios.exchanges]);
          if (resAxios.exchanges.length < itemsPerPage) {
            setHasMore(false);
            if (resAxios.exchanges.length === 0 && page === 0) {
              setNoItems(true);
            }
          }
        });
      })
      .catch((error) => {
        return;
      });
  };

  const setUpdatedExchange = (index: number, changedExchange: Exchange) => {
    setExchanges((prev) => {
      prev[index] = changedExchange;
      return [...prev];
    });
  };

  const removeExchangeFromList = (event: React.FormEvent, index: number) => {
    setExchanges((prev) => {
      if (prev.length === 1 || prev.length === 0) {
        setNoItems(true);
      }
      prev.splice(index, 1);
      return [...prev];
    });
  };

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
              <ExchangeCard
                exchange={exchange}
                index={index}
                key={exchange.id}
                removeExchangeFromList={removeExchangeFromList}
                setUpdatedExchange={setUpdatedExchange}
              />
            </Grid>
          </Grow>
        ))}
      </Grid>
    </InfiniteScroll>
  );
}
export default ExchangeList;
