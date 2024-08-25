import SearchIcon from "@mui/icons-material/Search";
import {
  Box,
  Button,
  Card,
  CardContent,
  InputAdornment,
  TextField,
} from "@mui/material";
import router from "next/router";
import { useEffect, useState } from "react";
import PerfectScrollbar from "react-perfect-scrollbar";
import { secondary, statisticsBackground } from "../../constants/colors";
import { HTTP_UNAUTHORIZED } from "../../constants/httpCodes";
import { HTTP_GET } from "../../constants/httpMethods";
import { Statistic } from "../../type/mzls";
import fetchWithAuthorization from "../../utils/axios/fetchWrapper";
import LoadingSpinner from "../../utils/loading_spinner/LoadingSpinner";
import snackbar from "../../utils/snackbar/snackbar";
import CategoriesChart from "./CategoriesChart";
import FridgesChart from "./FridgesChart";
import FridgesChartKG from "./FridgesChartKG";
import MonthButton from "./MonthButton";
import StatisticsChart from "./StatisticsChart";

interface StatisticsDataProps {
  t: Function;
}

const StatisticsData: React.FC<StatisticsDataProps> = ({ t }) => {
  const [statistics, setStatistics] = useState<Statistic>();
  const [loadingState, setLoadingState] = useState(true);
  const [numberOfMonths, setNumberOfMonths] = useState(36);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const fullPath = `/api/social-fridge/statistics?months=${numberOfMonths}`;

    await fetchWithAuthorization(fullPath, HTTP_GET)
      .then((response) => {
        if (response.status === HTTP_UNAUTHORIZED) {
          snackbar("errors.unauthorized", "error", t);
          router.push("/login");
        }
        return response.json();
      })
      .then((data) => {
        setStatistics(data.statistics);
      })
      .catch((error) => {
        snackbar("error", "error", t);
        snackbar("errors.error", "error", t);
      });

    setLoadingState(false);
  };

  return (
    <Box display="flex" flexDirection="column" flexGrow={1} height="100%">
      <LoadingSpinner open={loadingState} />
      {!loadingState && (
        <>
          <div
            style={{
              padding: "16px",
              display: "flex",
              alignItems: "center",
            }}
          >
            <MonthButton
              value={3}
              label={`3 ${t("statistics.months")}`}
              onClick={setNumberOfMonths}
            />
            <MonthButton
              value={6}
              label={`6 ${t("statistics.months")}`}
              onClick={setNumberOfMonths}
            />
            <MonthButton
              value={12}
              label={`12 ${t("statistics.months")}`}
              onClick={setNumberOfMonths}
            />
            <MonthButton
              value={24}
              label={`24 ${t("statistics.months")}`}
              onClick={setNumberOfMonths}
            />
          </div>
          <div
            style={{
              padding: "16px",
              display: "flex",
              alignItems: "center",
            }}
          >
            <TextField
              id="number-of-months"
              type="number"
              label={t("statistics.number_of_months")}
              variant="outlined"
              fullWidth
              value={numberOfMonths}
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
              onChange={(e) => setNumberOfMonths(Number(e.target.value))}
            />

            <Button
              variant="contained"
              type="submit"
              fullWidth
              style={{ color: secondary, marginLeft: "8px" }}
              onClick={fetchData}
            >
              {t("statistics.apply")}
            </Button>
          </div>
          <>
            <PerfectScrollbar>
              <Card
                style={{
                  backgroundColor: statisticsBackground,
                  margin: "10px",
                }}
              >
                <CardContent>
                  <FridgesChart statistics={statistics} t={t} />
                </CardContent>
              </Card>
              <Card
                style={{
                  backgroundColor: statisticsBackground,
                  margin: "10px",
                }}
              >
                <CardContent>
                  <FridgesChartKG statistics={statistics} t={t} />
                </CardContent>
              </Card>
              <Card
                style={{
                  backgroundColor: statisticsBackground,
                  margin: "10px",
                }}
              >
                <CardContent>
                  <CategoriesChart statistics={statistics} t={t} />
                </CardContent>
              </Card>
              <Card
                style={{
                  backgroundColor: statisticsBackground,
                  margin: "10px",
                }}
              >
                <CardContent>
                  <StatisticsChart statistics={statistics} t={t} />
                </CardContent>
              </Card>
            </PerfectScrollbar>
          </>
        </>
      )}
    </Box>
  );
};

export default StatisticsData;
