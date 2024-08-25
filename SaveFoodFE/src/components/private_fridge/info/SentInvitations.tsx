import TuneIcon from "@mui/icons-material/Tune";
import {
  TableBody,
  TableContainer,
  TablePagination,
  Typography,
} from "@mui/material";
import Collapse from "@mui/material/Collapse";
import Table from "@mui/material/Table";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { useTranslation } from "next-i18next";
import { useState } from "react";
import styles from "~/styles/private_fridge.module.css";
import usePrivateFridgeInvitationData from "../../../utils/custom_hook/usePrivateFridgeInvitationData";
import { filterStatus } from "../../../utils/filter_options/pf_options";
import {
  UserRole,
  permissions,
} from "../../../utils/pf_permissions/pf_permissions";
import DateTimeDisplay from "../DateTimeDisplay";
import FilterButton from "../filter/FilterButton";
import CancelInvitation from "./CancelInvitation";

const dictionary = "private_fridge";

interface Props {
  fridgeId: number;
  userRole: UserRole;
  isListInfoOpen: boolean;
}

export function SentInvitations({ fridgeId, userRole, isListInfoOpen }: Props) {
  const { t } = useTranslation(dictionary);
  const canCancelInvitation =
    permissions["canCancelInvitation"]?.includes(userRole);

  const [paginationParams, setPaginationParams] =
    useState<PrivateFridgesInvitationsPagginationParams>({
      page: 0,
      size: 10,
      privateFridgeId: fridgeId,
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
    <Collapse in={isListInfoOpen} unmountOnExit>
      <TableContainer className={styles["main-table-container"]}>
        <Table stickyHeader aria-label="sticky table">
          <TableHead>
            <TableRow>
              <TableCell className={styles["list-first-cell"]}>
                {t("invitation.receiver")}
              </TableCell>
              <TableCell className={styles["list-medium-cell"]}>
                {t("invitation.post_date")}
              </TableCell>
              <TableCell className={styles["list-medium-cell"]}>
                {t("invitation.addressee")}
              </TableCell>
              <TableCell className={styles["list-medium-cell"]}>Rola</TableCell>
              <TableCell className={styles["list-medium-cell"]}>
                {t("invitation.status")}
              </TableCell>
              <TableCell className={styles["list-short-cell"]}>
                <FilterButton
                  filterOptions={filterStatus}
                  icon={<TuneIcon />}
                  selectedValue={paginationParams.status}
                  filterChangeHandler={(option) =>
                    setPaginationParams((prevParams) => ({
                      ...prevParams,
                      status: option,
                    }))
                  }
                  title={t(`filter.fiter_status_title`)}
                />
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isListEmpty ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography variant="subtitle1">
                    {t("invitation.sent_empty_list")}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              invitations.map((invitation) => (
                <TableRow hover key={invitation.id}>
                  <TableCell>{invitation.receiver.username}</TableCell>
                  <TableCell>
                    <DateTimeDisplay
                      dateString={invitation.creationDateTime}
                      withTime={true}
                    />
                  </TableCell>
                  <TableCell>{invitation.createdBy}</TableCell>
                  <TableCell>
                    {t(`private_fridge.roles.${invitation.role}`.toLowerCase())}
                  </TableCell>
                  <TableCell>
                    {t(`filter.${invitation.status}`.toLowerCase())}
                  </TableCell>
                  <TableCell className={styles["list-short-cell"]}>
                    {canCancelInvitation && invitation.status === "NEW" && (
                      <CancelInvitation invitation={invitation} />
                    )}
                  </TableCell>
                </TableRow>
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
    </Collapse>
  );
}
