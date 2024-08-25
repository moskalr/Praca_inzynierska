import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import TablePagination from "@mui/material/TablePagination";
import { useTranslation } from "next-i18next";
import { useState } from "react";
import styles from "~/styles/private_fridge.module.css";
import usePrivateFridgeInvitationData from "../../../utils/custom_hook/usePrivateFridgeInvitationData";
import { CollapsibleInvitationsTable } from "./CollapsibleInvitationsRow";

const dictionary = "private_fridge";

function PrivateFridgesReceivedInvitations() {
  const { t } = useTranslation(dictionary);

  const [paginationParams, setPaginationParams] =
    useState<PrivateFridgesInvitationsPagginationParams>({
      page: 0,
      size: 10,
      privateFridgeId: null,
      status: null,
    });

  const { invitations, numberOfInvitations, handleUpdateInvitationState } =
    usePrivateFridgeInvitationData(paginationParams, t);

  const isListEmpty = invitations.length === 0;

  const handleChangePage = (event: unknown, newPage: number) => {
    setPaginationParams((prevParams) => ({
      ...prevParams,
      page: newPage,
    }));
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newSize = parseInt(event.target.value, 10);
    setPaginationParams((prevParams) => ({
      ...prevParams,
      size: newSize,
      page: 0,
    }));
  };

  return (
    <Paper className={styles["main-paper"]}>
      <TableContainer className={styles["main-table-container"]}>
        <Table stickyHeader aria-label="sticky table">
          <TableHead>
            <TableRow>
              <TableCell />
              <TableCell>{t(`private_fridge.name`)}</TableCell>
              <TableCell colSpan={2}>{t(`private_fridge.role`)}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isListEmpty ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  <Typography>{t("invitation.empty_list")}</Typography>
                </TableCell>
              </TableRow>
            ) : (
              invitations.map((invitation, index) => (
                <CollapsibleInvitationsTable
                  invitation={invitation}
                  handleUpdateInvitationState={() =>
                    handleUpdateInvitationState(index)
                  }
                />
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={numberOfInvitations}
        rowsPerPage={paginationParams.size}
        page={paginationParams.page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage={t("invitation.rows_per_page")}
      />
    </Paper>
  );
}

export default PrivateFridgesReceivedInvitations;
