import ArticleRoundedIcon from "@mui/icons-material/ArticleRounded";
import BeenhereRoundedIcon from "@mui/icons-material/BeenhereRounded";
import DirectionsRunRoundedIcon from "@mui/icons-material/DirectionsRunRounded";
import ExpandLessRoundedIcon from "@mui/icons-material/ExpandLessRounded";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import PeopleIcon from "@mui/icons-material/PeopleRounded";
import { Button, Collapse, Divider, Grid, Typography } from "@mui/material";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { accent } from "../../../constants/colors";
import { eaaDictionary } from "../../../constants/dictionary";
import { AccountStatistics } from "../../../type/mzwo";
import { eaaCalculateCategoryPercentages } from "../../../utils/calculatePercentages/eaaCategoryPercentages";
import MultipleStatisticsCard from "./MultipleStatisticsCard";
import SingleStatisticsCard from "./SingleStatisticsCard";
import TextOnlyStatisticsCard from "./TextOnlyStatisticsCard";

interface AccountStatisticsSectionProps {
  accountStatistics: AccountStatistics;
}

function AccountStatisticsSection({
  accountStatistics,
}: AccountStatisticsSectionProps) {
  const { t } = useTranslation(eaaDictionary);
  const [statisticsExpanded, setStatisticsExpanded] = useState(false);

  const handleExpandClick = () => {
    setStatisticsExpanded((prev) => !prev);
  };

  const calculateSafedFoodPercentages = eaaCalculateCategoryPercentages(
    accountStatistics.totalFoodClaimed,
    accountStatistics.totalEventFood
  );

  return (
    <Grid container spacing={2} justifyContent="space-evenly">
      <Grid container spacing={2} xs={12}>
        <Grid item xs={12}>
          <Divider textAlign="center" flexItem>
            <Typography variant="subtitle1">
              {t("userPanel.statistics.my")}
            </Typography>
          </Divider>
        </Grid>
        <Grid item xs={3}>
          <TextOnlyStatisticsCard
            title={t("userPanel.statistics.eventsCreated")}
            value={accountStatistics.eventsCreated}
            icon={<PeopleIcon fontSize="large" sx={{ color: "green" }} />}
          />
        </Grid>
        <Grid item xs={3}>
          <TextOnlyStatisticsCard
            title={t("userPanel.statistics.announcementsPublished")}
            value={accountStatistics.announcementsPublished}
            icon={
              <ArticleRoundedIcon fontSize="large" sx={{ color: "blue" }} />
            }
          />
        </Grid>
        <Grid item xs={3}>
          <TextOnlyStatisticsCard
            title={t("userPanel.statistics.reservationsMade")}
            value={accountStatistics.reservationsMade}
            icon={
              <BeenhereRoundedIcon fontSize="large" sx={{ color: "red" }} />
            }
          />
        </Grid>
        <Grid item xs={3}>
          <TextOnlyStatisticsCard
            title={t("userPanel.statistics.eventsAttended")}
            value={accountStatistics.eventsAttended}
            icon={
              <DirectionsRunRoundedIcon
                fontSize="large"
                sx={{ color: "purple" }}
              />
            }
          />
        </Grid>
        <Grid item xs={6}>
          <TextOnlyStatisticsCard
            title={t("userPanel.statistics.totalEventsParticipants")}
            value={accountStatistics.totalEventsParticipants}
          />
          <SingleStatisticsCard
            title={t("userPanel.statistics.averageEventParticipants")}
            value={accountStatistics.averageEventParticipants}
            borderStyle="solid"
          />
        </Grid>
        <Grid item xs={6}>
          <TextOnlyStatisticsCard
            title={t("userPanel.statistics.reservationsByParticipants")}
            value={accountStatistics.reservationsByParticipants}
          />
          <SingleStatisticsCard
            title={t("userPanel.statistics.mostCommonCategory")}
            value={
              accountStatistics.mostCommonCategory !== "---"
                ? t(
                    `category.${accountStatistics.mostCommonCategory.toLowerCase()}`
                  )
                : "---"
            }
            borderStyle="dotted"
          />
        </Grid>
      </Grid>
      <Grid xs={11.8}>
        <MultipleStatisticsCard
          title={t("userPanel.statistics.myClaimedFood")}
          values={accountStatistics.yourClaimedFood}
        />
      </Grid>
      <Collapse
        sx={{ width: "100%", justifyContent: "center", alignContent: "center" }}
        in={statisticsExpanded}
        timeout={1000}
      >
        <div style={{ justifyContent: "center", alignItems: "center" }}>
          <Grid item xs={11.8}>
            <MultipleStatisticsCard
              title={t("userPanel.statistics.totalFoodClaimed")}
              values={accountStatistics.totalFoodClaimed}
            />
          </Grid>
          <Grid item xs={11.8}>
            <MultipleStatisticsCard
              title={t("userPanel.statistics.totalEventFood")}
              values={accountStatistics.totalEventFood}
            />
          </Grid>
          <Grid item xs={11.8}>
            <MultipleStatisticsCard
              title={t("userPanel.statistics.averageFoodGiven")}
              values={accountStatistics.averageEventFoodGiven}
            />
          </Grid>
          <Grid item xs={11.8}>
            <MultipleStatisticsCard
              title={t("userPanel.statistics.percentageOfSafedFood")}
              values={calculateSafedFoodPercentages}
              percentages={true}
            />
          </Grid>
        </div>
      </Collapse>
      <Grid>
        <Button
          sx={{
            color: "secondary.main",
            borderRadius: "20px",
            "&:hover": {
              color: accent,
            },
          }}
          onClick={handleExpandClick}
        >
          <Typography>
            {t(`userPanel.statistics.${statisticsExpanded ? "less" : "more"}`)}
          </Typography>
          {statisticsExpanded ? (
            <ExpandLessRoundedIcon />
          ) : (
            <ExpandMoreRoundedIcon />
          )}
        </Button>
      </Grid>
    </Grid>
  );
}

export default AccountStatisticsSection;
