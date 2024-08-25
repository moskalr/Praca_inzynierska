import ReportGmailerrorredIcon from "@mui/icons-material/ReportGmailerrorred";
import { Box, Button, Dialog, Paper, Typography } from "@mui/material";
import { useTranslation } from "next-i18next";
import { useState } from "react";
import styles from "~/styles/private_fridge.module.css";
import {
  UserRole,
  permissions,
} from "../../../utils/pf_permissions/pf_permissions";
import EditPrivateFridgeInfo from "../edit/EditPrivateFridgeInfo";
import QuitPrivateFridge from "../edit/QuitPrivateFridge";
import fetchWithAuthorization from "../../../utils/axios/fetchWrapper";
import { HTTP_GET } from "../../../constants/httpMethods";
import snackbar from "../../../utils/snackbar/snackbar";
import LoadingState from "../../../utils/loading_spinner/LoadingSpinner";

const dictionary = "private_fridge";

interface Props {
  fridge: PrivateFridgeInfoData;
  userRole: UserRole;
  accountFridge: PrivateFridgeAccountListData | undefined;
  handleFridgeUpdate(newFridgeData: PrivateFridgeInfoData): void;
}

export function PrivateFridgeInfoTab({
  fridge,
  userRole,
  accountFridge,
  handleFridgeUpdate,
}: Props) {
  const { t } = useTranslation(dictionary);
  const canEditFridge = permissions["canEditFridge"]?.includes(userRole);
  const canQuitFridge = permissions["canQuitFridge"]?.includes(userRole);
  const [fridgeTag, setFridgeTag] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleFormSubmit = (newData: PrivateFridgeInfoData) => {
    handleFridgeUpdate(newData);
    setIsFormOpen(false);
  };

  const handleOpenDialog = () => {
    setIsLoading(true);
    getFridgeForEtag();
  };

  const handleCloseDialog = () => {
    setIsFormOpen(false);
  };

  const getFridgeForEtag = async () => {
    try {
      const response = await fetchWithAuthorization(
        `/api/private-fridge/fridges/${fridge.id}`,
        HTTP_GET
      );

      const data = await response.json();
      if (response.ok) {
        setFridgeTag(data.etag);
        handleFridgeUpdate(data.fridge);
        setIsLoading(false);
        setIsFormOpen(true);
        return;
      } else if (data.key !== undefined) {
        snackbar(data.key, "error", t);
      }
    } catch (error) {
      snackbar("snackbar.errorMessage.default", "error", t);
    }
  };

  return (
    <>
      <LoadingState open={isLoading} />
      <Typography
        component="h1"
        variant="h4"
        className={styles["fridge-title"]}
      >
        {fridge.title}
      </Typography>
      <Typography
        component="h1"
        variant="h6"
        className={styles["fridge-title"]}
      >
        {fridge.description}
      </Typography>
      {fridge.archived && (
        <Box className={styles["achived-fridge-info"]}>
          <ReportGmailerrorredIcon className={styles["report-icon-left"]} />
          <Typography component="h1" variant="h6" align="center">
            {t("private_fridge.archived_info")}
          </Typography>
          <ReportGmailerrorredIcon className={styles["report-icon-right"]} />
        </Box>
      )}
      <Paper className={styles["paper-option"]}>
        <Typography variant="h5" marginLeft={5}>
          {t("private_fridge.role_info")}
          {t(`private_fridge.roles.${userRole}`.toLowerCase())}
        </Typography>
        {canEditFridge && (
          <>
            <Button
              component="div"
              onClick={() => handleOpenDialog()}
              className={styles["fridge-button"]}
            >
              <Typography variant="h6" sx={{ flexGrow: 1 }}>
                {t("private_fridge.edit")}
              </Typography>
            </Button>
            <Dialog open={isFormOpen} onClose={() => setIsFormOpen(false)}>
              <EditPrivateFridgeInfo
                fridgeTag={fridgeTag}
                fridge={fridge}
                handleFridgeUpdate={handleFormSubmit}
                handleCloseDialog={handleCloseDialog}
              />
            </Dialog>
          </>
        )}
        {canQuitFridge && (
          <QuitPrivateFridge accountFridge={accountFridge} fridge={fridge} />
        )}
      </Paper>
    </>
  );
}
