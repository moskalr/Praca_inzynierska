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
import { useContext, useState } from "react";
import { UserContext } from "../../../components/context/UserContextProvider";
import useAccountsData from "../../../utils/custom_hook/useAccountsData";
import { filterRoles } from "../../../utils/filter_options/pf_options";
import {
  UserRole,
  permissions,
} from "../../../utils/pf_permissions/pf_permissions";
import FilterButton from "../filter/FilterButton";
import ChangeUserRole from "./ChangeUserRole";
import styles from "~/styles/private_fridge.module.css";

const dictionary = "private_fridge";

interface Props {
  fridgeId: number;
  userRole: UserRole;
  isListInfoOpen: boolean;
}

export function AccountsList({ fridgeId, userRole, isListInfoOpen }: Props) {
  const { t } = useTranslation(dictionary);
  const { usernameAccount } = useContext(UserContext);
  const canEditUser = permissions["canEditUser"]?.includes(userRole);

  const [paginationParams, setPaginationParams] =
    useState<AccountsPagginationParams>({
      page: 0,
      size: 10,
      role: "",
    });

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

  const { accounts, numberOfAccounts } = useAccountsData(
    fridgeId,
    paginationParams,
    t
  );

  const isListEmpty = accounts.length === 0;

  return (
    <Collapse in={isListInfoOpen} unmountOnExit>
      <TableContainer>
        <Table stickyHeader aria-label="sticky table">
          <TableHead>
            <TableRow>
              <TableCell className={styles["list-first-cell"]}>
                {t(`private_fridge.username`)}
              </TableCell>
              <TableCell className={styles["list-medium-cell"]}>
                {t(`private_fridge.role`)}
              </TableCell>
              <TableCell className={styles["list-short-cell"]}>
                <FilterButton
                  filterOptions={filterRoles}
                  icon={<TuneIcon />}
                  selectedValue={paginationParams.role}
                  filterChangeHandler={(option) =>
                    setPaginationParams((prevParams) => ({
                      ...prevParams,
                      role: option,
                    }))
                  }
                  title={t(`filter.filter_role_title`)}
                />
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isListEmpty ? (
              <TableRow>
                <TableCell colSpan={3} align="center">
                  <Typography variant="subtitle1">
                    {t("private_fridge.accounts_empty_list")}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              accounts.map((user) => (
                <TableRow hover key={user.account.id}>
                  <TableCell>{user.account.username}</TableCell>
                  <TableCell>
                    {t(`private_fridge.roles.${user.role}`.toLowerCase())}
                  </TableCell>
                  <TableCell className={styles["list-short-cell"]}>
                    {canEditUser ? (
                      user.account.username === usernameAccount ? (
                        t("private_fridge.your_account")
                      ) : (
                        <ChangeUserRole account={user} />
                      )
                    ) : (
                      user.account.username === usernameAccount &&
                      t("private_fridge.your_account")
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
        count={numberOfAccounts}
        rowsPerPage={paginationParams.size}
        page={paginationParams.page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage={t("private_fridge.account_rows_per_page")}
      />
    </Collapse>
  );
}
