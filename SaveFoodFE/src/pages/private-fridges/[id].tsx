import BarChartIcon from "@mui/icons-material/BarChart";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import KitchenIcon from "@mui/icons-material/Kitchen";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import { IconButton, Tab } from "@mui/material";
import { GetStaticPaths } from "next";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { DetailsTab } from "../../components/private_fridge/info/DetailsTab";
import { PrivateFridgeInfoTab } from "../../components/private_fridge/info/PrivateFridgeInfoTab";
import { ProductList } from "../../components/private_fridge/product/ProductList";
import { tabColorRoot, tabColorSelected } from "../../constants/colors";
import { HTTP_OK } from "../../constants/httpCodes";
import { HTTP_GET } from "../../constants/httpMethods";
import fetchWithAuthorization from "../../utils/axios/fetchWrapper";
import {
  UserRole,
  permissions,
} from "../../utils/pf_permissions/pf_permissions";
import LoadingState from "../../utils/loading_spinner/LoadingSpinner";
import snackbar from "../../utils/snackbar/snackbar";
import styles from "~/styles/private_fridge.module.css";

const dictionary = "private_fridge";

export function PrivateFridge() {
  const { t } = useTranslation(dictionary);
  const router = useRouter();
  const [privateFridge, setPrivateFridge] =
    useState<PrivateFridgeInfoData | null>(null);
  const { id } = router.query;

  const [tabsValue, setTabsValue] = useState("1");
  const [userPrivateFridgeRole, setUserPrivateFridgeRole] =
    useState<UserRole>();
  const [accountFridge, setAccountFridge] =
    useState<PrivateFridgeAccountListData>();
  const [loadingState, setLoadingState] = useState(true);

  const handleChangeTabsOption = (
    event: React.SyntheticEvent,
    newValue: string
  ) => {
    setTabsValue(newValue);
  };

  useEffect(() => {
    fetchPrivateFridgeData();
    fetchCurrentUserRoleInTheFridge();
  }, []);

  const fetchPrivateFridgeData = () => {
    fetchWithAuthorization(`/api/private-fridge/fridges/${id}`, HTTP_GET)
      .then((response) => {
        if (response.status === HTTP_OK) {
          return response.json();
        }
      })
      .then((data) => {
        setPrivateFridge(data.fridge);
      })
      .catch((error) => {
        setLoadingState(false);
        snackbar("error", "error", t);
        router.push("/");
      });
  };

  const fetchCurrentUserRoleInTheFridge = () => {
    fetchWithAuthorization(
      `/api/private-fridge/fridges-accounts/fridges/${id}`,
      HTTP_GET
    )
      .then((response) => {
        if (response.status === HTTP_OK) {
          return response.json();
        }
      })
      .then((data) => {
        setLoadingState(false);
        setUserPrivateFridgeRole(data.account.role);
        setAccountFridge(data.account);
      })
      .catch((error) => {
        setLoadingState(false);
        snackbar("error", "error", t);
        router.push("/");
      });
  };

  const handleFridgeUpdate = (newFridgeData: PrivateFridgeInfoData) => {
    setPrivateFridge((prev) => ({ ...prev, ...newFridgeData }));
  };

  const isFridgeArchived = privateFridge?.archived;

  return (
    <>
      <LoadingState open={loadingState} />
      {!loadingState && privateFridge && userPrivateFridgeRole && (
        <TabContext value={tabsValue}>
          <TabList
            onChange={handleChangeTabsOption}
            variant="fullWidth"
            sx={{
              "& button.MuiTab-root": {
                color: tabColorRoot,
              },
              "& button.Mui-selected": {
                color: tabColorSelected,
              },
            }}
          >
            <Tab
              icon={<KitchenIcon />}
              label={t("private_fridge.tabs_titles.fridge")}
              value={"1"}
            />
            {permissions["canGetRecipes"]?.includes(userPrivateFridgeRole) && (
              <Tab
                icon={<MenuBookIcon />}
                label={t("private_fridge.tabs_titles.recipes")}
                value={"2"}
              />
            )}
            <Tab
              icon={<BarChartIcon />}
              label={t("private_fridge.tabs_titles.history")}
              value={"3"}
            />
            <Link href={`/private-fridges`}>
              <IconButton className={styles["exit-button"]}>
                <ExitToAppIcon />
              </IconButton>
            </Link>
          </TabList>
          <TabPanel value="1">
            <PrivateFridgeInfoTab
              fridge={privateFridge}
              userRole={userPrivateFridgeRole}
              accountFridge={accountFridge}
              handleFridgeUpdate={handleFridgeUpdate}
            />
            <DetailsTab
              fridgeId={privateFridge.id}
              userRole={userPrivateFridgeRole}
            />
            {!isFridgeArchived && (
              <ProductList
                userRole={userPrivateFridgeRole}
                fridgeId={privateFridge.id}
              />
            )}
          </TabPanel>
          <TabPanel value="2"></TabPanel>
          <TabPanel value="3"></TabPanel>
        </TabContext>
      )}
    </>
  );
}

export async function getStaticProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, [dictionary, "navbar"])),
    },
  };
}

export const getStaticPaths: GetStaticPaths<{ slug: string }> = async () => {
  return {
    paths: [],
    fallback: "blocking",
  };
};

export default PrivateFridge;
