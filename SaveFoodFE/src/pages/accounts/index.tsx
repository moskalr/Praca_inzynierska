import SearchIcon from "@mui/icons-material/Search";
import { TextField } from "@mui/material";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { enqueueSnackbar } from "notistack";
import { useEffect, useState } from "react";
import AccountInList from "../../components/account/accountInList";
import PrimaryButton from "../../components/buttons/PrimaryButton";
import { box_title, primary, secondary } from "../../constants/colors";
import { HTTP_CONFLICT } from "../../constants/httpCodes";
import { HTTP_GET, HTTP_PATCH } from "../../constants/httpMethods";
import fetchWithAuthorization from "../../utils/axios/fetchWrapper";
import { Account } from "../../type/account";

const dictionary = "accounts";

export function Accounts() {
  const { t } = useTranslation(dictionary);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [searchUsername, setSearchUsername] = useState("");

  useEffect(() => {
    const fetchAccountList = async () => {
      try {
        const response = await fetchWithAuthorization(
          "/api/accounts",
          HTTP_GET
        );
        if (response.ok) {
          const data = await response.json();
          setAccounts(data.accounts);
          return;
        }
        enqueueSnackbar(t(`error_message.error`), { variant: "error" });
      } catch (error) {
        enqueueSnackbar(t(`error_message.default_error`), {
          variant: "error",
        });
      }
    };
    fetchAccountList();
  }, []);

  const handleSearch = async () => {
    try {
      const queryParams = {
        username: searchUsername,
      };

      const queryString = new URLSearchParams(queryParams).toString();

      const response = await fetchWithAuthorization(
        `/api/accounts?${queryString}`,
        HTTP_GET
      );
      if (response.ok) {
        const data = await response.json();
        setAccounts(data.accounts);
        if (data.accounts.length === 0) {
          enqueueSnackbar(t(`error_message.accounts_not_found`), {
            variant: "error",
          });
        }
        return;
      }
      enqueueSnackbar(t(`error_message.error`), { variant: "error" });
    } catch (error) {
      enqueueSnackbar(t(`error_message.default_error`), {
        variant: "error",
      });
    }
  };

  const handleEnable = async (username: string, enabled: boolean) => {
    const newAccounts = accounts.map((account) =>
      account.username === username
        ? { ...account, isEnabled: enabled }
        : account
    );
    const patchData = [
      {
        op: "replace",
        path: "/isEnabled",
        value: enabled,
      },
    ];

    try {
      const requestOptions = {
        body: JSON.stringify({
          username: username,
          patchData: patchData,
        }),
      };

      const response = await fetchWithAuthorization(
        "/api/patchAccount",
        HTTP_PATCH,
        requestOptions
      );
      if (response.ok) {
        const data = await response.json();
        setAccounts(newAccounts);
        enqueueSnackbar(
          t(
            enabled
              ? `success_message.account_enabled`
              : `success_message.account_disabled`
          ),
          {
            variant: "success",
          }
        );
        return;
      }
      if (response.status === HTTP_CONFLICT) {
        enqueueSnackbar(
          t(
            enabled
              ? `error_message.enabling_error`
              : `error_message.disabling_error`
          ),
          {
            variant: "error",
          }
        );
        return;
      }
      enqueueSnackbar(
        t(
          enabled
            ? `error_message.enabling_error`
            : `error_message.disabling_error`
        ),
        {
          variant: "error",
        }
      );
    } catch (error) {
      enqueueSnackbar(t(`error_message.default_error`), {
        variant: "error",
      });
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: "3vh",
          marginBottom: "3vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "100%",
        }}
      >
        <>
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            width="90vw"
            height="48px"
            marginBottom="10px"
            bgcolor={box_title}
            boxShadow="0 4px 6px rgba(0, 0, 0, 0.1)"
            borderRadius="5px"
          >
            <Typography component="h1" variant="h5">
              {t("accounts.title")}
            </Typography>
          </Box>

          <Box
            display="flex"
            alignItems="center"
            width="90vw"
            marginBottom="10px"
          >
            <TextField
              label={t("info_message.search_by_username")}
              value={searchUsername}
              onChange={(e) => setSearchUsername(e.target.value)}
              variant="outlined"
              size="small"
              inputProps={{
                maxLength: 16,
              }}
              sx={{ width: "80vw", marginRight: "10px" }}
              InputProps={{
                startAdornment: <SearchIcon />,
              }}
            />
            <PrimaryButton
              onClick={handleSearch}
              width="10vw"
              color={primary}
              hoverColor={secondary}
            >
              {t("info_message.search")}
            </PrimaryButton>
          </Box>

          {accounts.map(
            ({
              username,
              firstName,
              lastName,
              isEnabled,
              email,
              language,
              roles,
            }) => {
              return (
                <AccountInList
                  key={username}
                  {...{
                    username,
                    firstName,
                    lastName,
                    isEnabled,
                    email,
                    language,
                    roles,
                  }}
                />
              );
            }
          )}
        </>
      </Box>
    </Container>
  );
}

export async function getServerSideProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, [dictionary, "navbar"])),
    },
  };
}

export default Accounts;
