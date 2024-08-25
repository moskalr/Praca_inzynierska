import CachedIcon from "@mui/icons-material/Cached";
import FilterListIcon from "@mui/icons-material/FilterList";
import SortByAlphaIcon from "@mui/icons-material/SortByAlpha";
import {
  Box,
  Checkbox,
  Container,
  FormControlLabel,
  IconButton,
  Popover,
} from "@mui/material";
import router from "next/router";
import { useEffect, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import SuggestionDisplay from "../../components/suggestions/SuggestionDisplay";
import { secondary } from "../../constants/colors";
import { HTTP_UNAUTHORIZED } from "../../constants/httpCodes";
import { HTTP_GET, HTTP_PATCH } from "../../constants/httpMethods";
import { Suggestion } from "../../type/mzls";
import fetchWithAuthorization from "../../utils/axios/fetchWrapper";
import LoadingSpinner from "../../utils/loading_spinner/LoadingSpinner";
import snackbar from "../../utils/snackbar/snackbar";
import sortByStreet from "../../utils/sorting/sortByStreet";

interface SuggestionsProps {
  t: Function;
}

const Suggestions: React.FC<SuggestionsProps> = ({ t }) => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loadingState, setLoadingState] = useState(true);
  const [ascendingOrder, setAscendingOrder] = useState(true);
  const [openFilter, setOpenFilter] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [suggestionsState, setSuggestionsState] = useState(true);
  const itemsPerPage = 12;
  const [hasMore, setHasMore] = useState(true);
  const [nextPage, setNextPage] = useState(0);

  const fetchSuggestions = async (
    suggestionsState: boolean,
    isFiltering: boolean,
    page: number
  ) => {
    const newPage = page + 1;
    const fullPath = `/api/social-fridge/suggestions?isNew=${suggestionsState}&size=${itemsPerPage}&page=${page}`;

    await fetchWithAuthorization(fullPath, HTTP_GET)
      .then((response) => {
        if (response.status === HTTP_UNAUTHORIZED) {
          snackbar("errors.unauthorized", "error", t);
          router.push("/login");
        }
        return response.json();
      })
      .then((data) => {
        if (data.suggestions.length > 0 && !isFiltering) {
          setSuggestions([...suggestions, ...data.suggestions]);
          setNextPage(newPage);
          if (data.suggestions.length < itemsPerPage) {
            setHasMore(false);
          }
        } else if (isFiltering) {
          setSuggestions(data.suggestions);
          setNextPage(newPage);
          if (data.suggestions.length < itemsPerPage) {
            setHasMore(false);
          }
        } else {
          setHasMore(false);
        }
      })
      .catch((error) => {
        snackbar("errors.sugestion_error", "error", t);
      });
    setSuggestionsState(suggestionsState);
    setLoadingState(false);
  };

  useEffect(() => {
    fetchSuggestions(true, false, nextPage);
  }, []);

  const toggleSortingOrder = () => {
    sortByStreet(suggestions, !ascendingOrder);
    setAscendingOrder(!ascendingOrder);
  };

  const handleArchive = async (suggestion: Suggestion) => {
    const requestOptions = {
      body: JSON.stringify({
        value: false,
      }),
      headers: {
        "If-Match": suggestion.etag,
      },
    };

    await fetchWithAuthorization(
      `/api/social-fridge/suggestion/${suggestion.id}`,
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
            snackbar("suggestions.successes.success", "success", t);
            setSuggestions(
              suggestions.filter((object) => object.id !== suggestion.id)
            );
          } else if (data.error.key !== undefined) {
            snackbar(`errors.${data.error.key}`, "error", t);
          }
        });
      })
      .catch(() => {
        snackbar("errors.updateError", "error", t);
      });
  };

  const handleFilterClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
    setOpenFilter(true);
  };

  const handleCloseFilter = () => {
    setOpenFilter(false);
  };

  const handleRefresh = () => {
    setHasMore(true);
    setNextPage(0);

    fetchSuggestions(true, true, 0);
  };

  return (
    <div>
      <LoadingSpinner open={loadingState} />
      {!loadingState && (
        <Container component="main" maxWidth="xl">
          <IconButton onClick={handleFilterClick}>
            <FilterListIcon />
          </IconButton>

          <IconButton onClick={toggleSortingOrder}>
            <SortByAlphaIcon />
          </IconButton>

          <IconButton onClick={handleRefresh}>
            <CachedIcon />
          </IconButton>

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
                      checked={suggestionsState === true}
                      onChange={() => {
                        fetchSuggestions(true, true, 0), setHasMore(true);
                      }}
                      value="unread"
                      style={{ color: secondary }}
                    />
                  }
                  label={t("suggestions.messages.unreadSuggestions")}
                />
              </Box>
              <Box display="block">
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={suggestionsState === false}
                      onChange={() => {
                        fetchSuggestions(false, true, 0), setHasMore(true);
                      }}
                      value="read"
                      style={{ color: secondary }}
                    />
                  }
                  label={t("suggestions.messages.readSuggestions")}
                />
              </Box>
            </Box>
          </Popover>
          <InfiniteScroll
            dataLength={suggestions.length}
            next={() => fetchSuggestions(suggestionsState, false, nextPage)}
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
              {suggestions?.map((suggestion, index) => (
                <SuggestionDisplay
                  key={index}
                  suggestion={suggestion}
                  handleArchive={handleArchive}
                  t={t}
                />
              ))}
            </Box>
          </InfiniteScroll>
        </Container>
      )}
    </div>
  );
};

export default Suggestions;
