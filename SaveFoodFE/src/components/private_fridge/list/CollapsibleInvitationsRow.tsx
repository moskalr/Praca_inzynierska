import CancelIcon from "@mui/icons-material/Cancel";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import Box from "@mui/material/Box";
import Collapse from "@mui/material/Collapse";
import IconButton from "@mui/material/IconButton";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Tooltip from "@mui/material/Tooltip";
import { useTranslation } from "next-i18next";
import { useEffect, useState } from "react";
import { HTTP_OK } from "../../../constants/httpCodes";
import { HTTP_GET, HTTP_PATCH } from "../../../constants/httpMethods";
import { ACCEPTED, REJECTED } from "../../../constants/invitationStatus";
import styles from "~/styles/private_fridge.module.css";
import fetchWithAuthorization from "../../../utils/axios/fetchWrapper";
import snackbar from "../../../utils/snackbar/snackbar";
import {
  greenColorOfLetters,
  redColorOfLetters,
} from "../../../constants/colors";
import DateTimeDisplay from "../DateTimeDisplay";

const dictionary = "private_fridge";

export function CollapsibleInvitationsTable({
  invitation,
  handleUpdateInvitationState,
}: {
  invitation: PrivateFridgeInvitationData;
  handleUpdateInvitationState(): void;
}) {
  const { t } = useTranslation(dictionary);
  const [isInvitationInfoOpen, setInvitationInfoOpen] = useState(false);
  const [invitationTag, setInvitationTag] = useState<string | null>(null);

  useEffect(() => {
    getInvitationForEtag();
  }, [invitation]);

  const changeInvitationStatus = async (newStatus: string) => {
    await fetchInvitation(newStatus);
  };

  const getInvitationForEtag = async () => {
    try {
      const response = await fetchWithAuthorization(
        `/api/private-fridge/invitations/${invitation.id}`,
        HTTP_GET
      );

      const data = await response.json();
      if (response.ok) {
        setInvitationTag(data.etag);
        return;
      } else if (data.key !== undefined) {
        snackbar(data.key, "error", t);
      }
    } catch (error) {
      snackbar("snackbar.errorMessage.default", "error", t);
    }
  };

  const fetchInvitation = async (status: string) => {
    try {
      const requestOptions = {
        body: JSON.stringify({
          status: status,
        }),
        headers: {
          "If-Match": invitationTag,
        },
      };

      const response = await fetchWithAuthorization(
        `/api/private-fridge/invitations/${invitation.id}`,
        HTTP_PATCH,
        requestOptions
      );

      if (response.status === HTTP_OK) {
        const data = await response.json();
        snackbar("error_message.error", "success", t);
        handleUpdateInvitationState();
      } else {
        snackbar("error_message.error", "error", t);
      }
    } catch (error) {
      snackbar("error_message.error", "error", t);
    }
  };

  return (
    <>
      <TableRow sx={{ "& > *": { borderBottom: "unset" } }} hover>
        <TableCell>
          <IconButton
            onClick={() => setInvitationInfoOpen(!isInvitationInfoOpen)}
          >
            {isInvitationInfoOpen ? (
              <KeyboardArrowUpIcon />
            ) : (
              <KeyboardArrowDownIcon />
            )}
          </IconButton>
        </TableCell>
        <TableCell>{invitation.privateFridge.title}</TableCell>
        <TableCell>
          {t(`private_fridge.roles.${invitation.role}`.toLowerCase())}
        </TableCell>
        <TableCell>
          <Tooltip title={t("invitation.accept")}>
            <IconButton onClick={() => changeInvitationStatus(ACCEPTED)}>
              <CheckCircleIcon sx={{ color: greenColorOfLetters }} />
            </IconButton>
          </Tooltip>
          <Tooltip title={t("invitation.reject")}>
            <IconButton onClick={() => changeInvitationStatus(REJECTED)}>
              <CancelIcon sx={{ color: redColorOfLetters }} />
            </IconButton>
          </Tooltip>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell className={styles["collapseable-table-cell"]} colSpan={6}>
          <Collapse in={isInvitationInfoOpen} unmountOnExit>
            <Box>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>{t("invitation.post_date")}</TableCell>
                    <TableCell>{t("invitation.addressee")}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableCell>
                    <DateTimeDisplay
                      dateString={invitation.creationDateTime}
                      withTime={true}
                    />
                  </TableCell>
                  <TableCell>{invitation.createdBy}</TableCell>
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}
