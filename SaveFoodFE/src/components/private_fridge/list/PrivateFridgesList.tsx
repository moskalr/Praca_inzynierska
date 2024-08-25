import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import {
  IconButton,
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
import Link from "next/link";
import { useState } from "react";
import { FilterPrivateFridgeList } from "../../../components/private_fridge/private_fridge_filter";
import styles from "~/styles/private_fridge.module.css";
import usePrivateFridgeData from "../../../utils/custom_hook/usePrivateFridgeData";
import CreatePrivateFridge from "../CreatePrivateFridge";

const dictionary = "private_fridge";

function PrivateFridgeList() {
  const { t } = useTranslation(dictionary);

  const [paginationParams, setPaginationParams] =
    useState<PrivateFridgesPagginationParams>({
      page: 0,
      size: 10,
      isArchived: null,
    });

  const { fridges, numberOfPrivateFridges, handleUpdateFridgeList } =
    usePrivateFridgeData(paginationParams, t);

  const isListEmpty = fridges.length === 0;

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

  const handleFilterChange = (isArchived: boolean | null) => {
    setPaginationParams((prevParams) => ({
      ...prevParams,
      isArchived: isArchived,
    }));
  };

  return (
    <Paper className={styles["main-paper"]}>
      <CreatePrivateFridge handleUpdateFridgeList={handleUpdateFridgeList} />
      <TableContainer className={styles["main-table-container"]}>
        <Table stickyHeader aria-label="sticky table">
          <TableHead>
            <TableRow>
              <TableCell>{t(`private_fridge.name`)}</TableCell>
              <TableCell>{t(`private_fridge.role`)}</TableCell>
              <TableCell>
                <FilterPrivateFridgeList onFilterChange={handleFilterChange} />
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isListEmpty ? (
              <TableRow>
                <TableCell colSpan={3} align="center">
                  <Typography>{t("private_fridge.empty_list")}</Typography>
                </TableCell>
              </TableRow>
            ) : (
              fridges.map((fridge) => (
                <TableRow
                  hover
                  style={{
                    opacity: fridge.privateFridge.archived ? 0.5 : 1,
                  }}
                >
                  <TableCell>{fridge.privateFridge.title}</TableCell>
                  <TableCell>
                    {t(`private_fridge.roles.${fridge.role}`.toLowerCase())}
                  </TableCell>
                  <TableCell>
                    <Link href={`/private-fridges/${fridge.privateFridge.id}`}>
                      <IconButton edge="end" aria-label="Arrow">
                        <ChevronRightIcon />
                      </IconButton>
                    </Link>
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
        count={numberOfPrivateFridges}
        rowsPerPage={paginationParams.size}
        page={paginationParams.page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage={t("private_fridge.rows_per_page")}
      />
    </Paper>
  );
}

export default PrivateFridgeList;
