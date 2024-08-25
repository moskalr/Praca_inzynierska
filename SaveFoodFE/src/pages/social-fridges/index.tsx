import FavoriteIcon from "@mui/icons-material/Favorite";
import FoodBankIcon from "@mui/icons-material/FoodBank";
import KitchenIcon from "@mui/icons-material/Kitchen";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import QueryStatsIcon from "@mui/icons-material/QueryStats";
import { TabContext, TabList } from "@mui/lab";
import TabPanel from "@mui/lab/TabPanel";
import { useMediaQuery, useTheme } from "@mui/material";
import Tab from "@mui/material/Tab";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "../../components/context/UserContextProvider";
import FavCategoriesFridges from "../../components/fridge/FavCategoriesFridges";
import ManagedSocialFridges from "../../components/fridge/ManagedSocialFridgesDisplay";
import StatisticsData from "../../components/fridge/StatisticsData";
import MapDisplay from "../../components/map/MapDisplay";
import Products from "../../components/product/Products";
import Suggestions from "../../components/suggestions/Suggestions";
import {
  CLIENT_GUEST,
  CLIENT_MANAGER,
  CLIENT_USER,
} from "../../constants/roles";

const dictionary = "social-fridge";

export async function getServerSideProps({
  locale,
  req,
}: {
  locale: string;
  req: any;
}) {
  const currentRole = req.session?.currentRole || CLIENT_GUEST;
  const allowedRoles = [CLIENT_GUEST, CLIENT_USER, CLIENT_MANAGER];
  if (!allowedRoles.includes(currentRole)) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }
  return {
    props: {
      ...(await serverSideTranslations(locale, [dictionary, "navbar"])),
    },
  };
}

export function SocialFridge() {
  const { t } = useTranslation(dictionary);
  const [tabValue, setTabValue] = useState("1");
  const theme = useTheme();
  const [hydrated, setHydrated] = useState(false);

  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { currentRole } = useContext(UserContext);
  const handleChangeTabsOption = (
    event: React.SyntheticEvent,
    newValue: string
  ) => {
    setTabValue(newValue);
  };
  useEffect(() => {
    setHydrated(true);
  }, []);

  if (!hydrated) {
    return null;
  }
  return (
    <div>
      <TabContext value={tabValue}>
        <TabList
          variant={isMobile ? "scrollable" : "fullWidth"}
          onChange={handleChangeTabsOption}
          indicatorColor="secondary"
          textColor="secondary"
          component="div"
        >
          {currentRole === CLIENT_USER && (
            <Tab
              icon={<FavoriteIcon />}
              label={t("preferences.details.favotities")}
              value={"0"}
            />
          )}

          <Tab
            icon={<QueryStatsIcon />}
            label={t("preferences.details.statistics")}
            value={"1"}
          />

          {currentRole === CLIENT_MANAGER && (
            <Tab
              icon={<KitchenIcon />}
              label={t("preferences.details.managedSocialFridges")}
              value={"2"}
            />
          )}

          <Tab
            icon={<FoodBankIcon />}
            label={t("preferences.details.products")}
            value={"3"}
          />

          {currentRole === CLIENT_MANAGER && (
            <Tab
              icon={<MailOutlineIcon />}
              label={t("preferences.details.suggestions")}
              value={"4"}
            />
          )}

          <Tab
            icon={<LocationOnIcon />}
            label={t("preferences.details.fridges")}
            value={"5"}
          />
        </TabList>

        <TabPanel value="0">
          <FavCategoriesFridges t={t} />
        </TabPanel>
        <TabPanel value="1">
          <StatisticsData t={t} />
        </TabPanel>
        <TabPanel value="2">
          <ManagedSocialFridges t={t} />
        </TabPanel>
        <TabPanel value="3">
          <Products t={t} />
        </TabPanel>
        <TabPanel value="4">
          <Suggestions t={t} />
        </TabPanel>
        <TabPanel value="5">
          <MapDisplay t={t} />
        </TabPanel>
      </TabContext>
    </div>
  );
}

export default SocialFridge;
