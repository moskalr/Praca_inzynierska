import KitchenIcon from "@mui/icons-material/Kitchen";
import MailIcon from "@mui/icons-material/Mail";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import Tab from "@mui/material/Tab";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useState } from "react";
import PrivateFridgeList from "../../components/private_fridge/list/PrivateFridgesList";
import PrivateFridgesReceivedInvitations from "../../components/private_fridge/list/PrivateFridgesReceivedInvitations";
import { tabColorRoot, tabColorSelected } from "../../constants/colors";

const dictionary = "private_fridge";

export function PrivateFridges() {
  const { t } = useTranslation(dictionary);
  const [tabsValue, setTabsValue] = useState("1");

  const handleChangeTabsOption = (
    event: React.SyntheticEvent,
    newValue: string
  ) => {
    setTabsValue(newValue);
  };

  return (
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
          label={t("private_fridge.tabs_titles.fridges")}
          value={"1"}
        />
        <Tab
          icon={<MailIcon />}
          label={t("private_fridge.tabs_titles.invitations")}
          value={"2"}
        />
      </TabList>
      <TabPanel value="1">
        <PrivateFridgeList />
      </TabPanel>
      <TabPanel value="2">
        <PrivateFridgesReceivedInvitations />
      </TabPanel>
    </TabContext>
  );
}

export async function getStaticProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, [dictionary, "navbar"])),
    },
  };
}

export default PrivateFridges;
