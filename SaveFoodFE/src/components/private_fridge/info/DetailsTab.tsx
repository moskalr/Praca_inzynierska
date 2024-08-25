import { TabList } from "@mui/lab";
import TabContext from "@mui/lab/TabContext";
import TabPanel from "@mui/lab/TabPanel";
import { Tab } from "@mui/material";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import { useTranslation } from "next-i18next";
import { useState } from "react";
import { tabColorRoot, tabColorSelected } from "../../../constants/colors";
import styles from "~/styles/private_fridge.module.css";
import {
  UserRole,
  permissions,
} from "../../../utils/pf_permissions/pf_permissions";
import { DropDownButton } from "../useFrom/DropDownButton";
import { AccountsList } from "./AccountsList";
import AddAccount from "./AddAccount";
import { SentInvitations } from "./SentInvitations";

const dictionary = "private_fridge";

interface Props {
  fridgeId: number;
  userRole: UserRole;
}

export function DetailsTab({ fridgeId, userRole }: Props) {
  const { t } = useTranslation(dictionary);
  const [isListsInfoOpen, setListsInfoOpen] = useState(false);
  const [tabsValue, setTabsValue] = useState("1");
  const canSendInvitation =
    permissions["canSendInvitation"]?.includes(userRole);
  const canGetSentInvitations =
    permissions["canGetSentInvitations"]?.includes(userRole);

  const handleChangeTabsOption = (
    event: React.SyntheticEvent,
    newValue: string
  ) => {
    setTabsValue(newValue);
  };

  return (
    <TabContext value={tabsValue}>
      <TableRow className={styles["details-tab"]}>
        <TableCell className={styles["details-tab-icon"]}>
          <DropDownButton
            isListOpen={isListsInfoOpen}
            setListOpen={setListsInfoOpen}
          />
        </TableCell>
        <TableCell>
          <TabList
            onChange={handleChangeTabsOption}
            variant="fullWidth"
            sx={{
              "& button.MuiTab-root": {
                color: tabColorRoot,
              },
              "& button.Mui-selected": {
                color: tabColorSelected,
                fontWeight: "bold",
              },
            }}
          >
            <Tab
              className={styles["details-tab-first-text"]}
              label={t("private_fridge.tabs_titles.users")}
              value={"1"}
            />
            {canSendInvitation && (
              <Tab
                label={t("private_fridge.tabs_titles.sent_invitations")}
                value={"2"}
              />
            )}
          </TabList>
        </TableCell>
        {canSendInvitation && (
          <TableCell className={styles["details-tab-icon"]}>
            <AddAccount fridgeId={fridgeId} />
          </TableCell>
        )}
      </TableRow>
      <TabPanel value="1" className={styles["collapseable-table-cell"]}>
        <AccountsList
          fridgeId={fridgeId}
          userRole={userRole}
          isListInfoOpen={isListsInfoOpen}
        />
      </TabPanel>
      {canGetSentInvitations && (
        <TabPanel value="2" className={styles["collapseable-table-cell"]}>
          <SentInvitations
            fridgeId={fridgeId}
            userRole={userRole}
            isListInfoOpen={isListsInfoOpen}
          />
        </TabPanel>
      )}
    </TabContext>
  );
}
