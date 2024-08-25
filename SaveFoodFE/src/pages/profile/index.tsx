import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import EmailIcon from "@mui/icons-material/Email";
import {
  Box,
  Button,
  Chip,
  Container,
  Grid,
  IconButton,
  Typography,
} from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import Cookies from "js-cookie";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useRouter } from "next/router";
import { enqueueSnackbar } from "notistack";
import { useEffect, useState } from "react";
import PrimaryButton from "../../components/buttons/PrimaryButton";
import {
  background,
  errorClick,
  icon,
  primary,
  secondary,
} from "../../constants/colors";
import { HTTP_GET, HTTP_PATCH, HTTP_POST } from "../../constants/httpMethods";
import { CLIENT_USER, CLIENT_VOLUNTEER } from "../../constants/roles";
import fetchWithAuthorization from "../../utils/axios/fetchWrapper";
import {
  HTTP_CONFLICT,
  HTTP_FORBIDDEN,
  HTTP_NO_CONTENT,
  HTTP_OK,
} from "../../constants/httpCodes";
import { REFRESH_TOKEN, TOKEN, regexEmail } from "../../constants/variables";
import { Account } from "../../type/account";

const dictionary = "profile";

export function Profile() {
  const { t } = useTranslation("profile");
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState();
  const [account, setAccount] = useState<Account | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editedEmail, setEditedEmail] = useState("");
  const [isVolunteer, setIsVolunteer] = useState(true);
  const [rolesRequest, setRolesRequest] = useState<string[]>([]);
  const [isUser, setIsUser] = useState(true);
  const refreshToken = Cookies.get(REFRESH_TOKEN);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const response = await fetchWithAuthorization("/api/profile", HTTP_GET);
        if (response.status === HTTP_OK) {
          const data = await response.json();
          setAccount(data.account);
          setEditedEmail(data.account.email);
          setRolesRequest(data.account.roles);
          setIsUser(data.account.roles.includes(CLIENT_USER));
          setIsVolunteer(data.account.roles.includes(CLIENT_VOLUNTEER));
          return;
        }
        enqueueSnackbar(t(`error_message.error`), { variant: "error" });
      } catch (error) {
        enqueueSnackbar(t(`error_message.default_error`), {
          variant: "error",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchAccounts();
  }, []);

  const handleEditEmail = () => {
    setEditMode(true);
  };

  const handleConfirmEmailChange = async (event: React.FormEvent) => {
    event.preventDefault();
    if (account) {
      if (!regexEmail.test(editedEmail)) {
        enqueueSnackbar(t(`profile.error_message.email`), {
          variant: "error",
        });
        return;
      }
      if (editedEmail === account.email) {
        enqueueSnackbar(t(`profile.error_message.sameEmail`), {
          variant: "error",
        });
        return;
      }
      const reqUsername = account.username;
      const patchData = [
        {
          op: "replace",
          path: "/email",
          value: editedEmail,
        },
      ];
      try {
        const requestOptions = {
          body: JSON.stringify({
            username: reqUsername,
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
          setAccount((account) => ({
            ...account!,
            email: data.account.email,
          }));
          enqueueSnackbar(t(`profile.info_message.email`), {
            variant: "success",
          });
          setEditedEmail(data.account.email);
          setEditMode(false);
          return;
        }
        if (response.status === HTTP_CONFLICT) {
          enqueueSnackbar(t(`profile.error_message.emailAlreadyInUse`), {
            variant: "error",
          });
          return;
        }
        enqueueSnackbar(t(`profile.error_message.emailError`), {
          variant: "error",
        });
      } catch (error) {
        enqueueSnackbar(t(`profile.error_message.emailError`), {
          variant: "error",
        });
      }

      setEditedEmail(account.email);
      setEditMode(false);
    }
  };

  const handleCancelEmailChange = () => {
    setEditMode(false);
  };

  const handleChangePassword = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const response = await fetchWithAuthorization(
        "/api/changePassword",
        HTTP_POST
      );
      if (response.status === HTTP_NO_CONTENT) {
        enqueueSnackbar(t(`profile.info_message.password`), {
          variant: "success",
        });
        return;
      }
      enqueueSnackbar(t(`profile.error_message.passwordError`), {
        variant: "error",
      });
    } catch (error) {
      enqueueSnackbar(t(`profile.error_message.passwordError`), {
        variant: "error",
      });
    }
  };

  const refreshTokenFunction = async () => {
    try {
      const response = await fetch("/api/refreshToken", {
        method: HTTP_POST,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken }),
      });
      if (response.ok) {
        const data = await response.json();
        const accessToken = data.access_token;
        const refreshToken = data.refresh_token;
        Cookies.set(TOKEN, accessToken, { secure: true });
        Cookies.set(REFRESH_TOKEN, refreshToken, { secure: true });
        return;
      }
      enqueueSnackbar(t(`error_message.refreshToken`), { variant: "error" });
    } catch (error) {
      enqueueSnackbar(t(`error_message.refreshToken`), { variant: "error" });
    }
  };

  const handleBecomeUser = async (event: React.FormEvent) => {
    event.preventDefault();
    if (account) {
      rolesRequest.push(CLIENT_USER);
      const patchData = [
        {
          op: "add",
          path: "/roles",
          value: rolesRequest,
        },
      ];
      try {
        const requestOptions = {
          body: JSON.stringify({
            username: account.username,
            patchData: patchData,
          }),
        };

        const response = await fetchWithAuthorization(
          "/api/patchAccount",
          HTTP_PATCH,
          requestOptions
        );
        if (response.status === HTTP_OK) {
          const data = await response.json();
          setAccount((account) => ({
            ...account!,
            roles: data.account.roles,
          }));
          enqueueSnackbar(t(`profile.info_message.roleBecomeUser`), {
            variant: "success",
          });
          refreshTokenFunction();
          setIsUser(true);
          return;
        }
        if (response.status === HTTP_FORBIDDEN) {
          enqueueSnackbar(t(`profile.error_message.roleError`), {
            variant: "error",
          });
          return;
        }
        enqueueSnackbar(t(`profile.error_message.roleError`), {
          variant: "error",
        });
      } catch (error) {
        enqueueSnackbar(t(`profile.error_message.roleError`), {
          variant: "error",
        });
      }
    }
  };

  const handleRevokeUser = async (event: React.FormEvent) => {
    event.preventDefault();
    if (account) {
      let index = rolesRequest.indexOf(CLIENT_USER);
      if (index !== -1) {
        rolesRequest.splice(index, 1);
      }
      const patchData = [
        {
          op: "add",
          path: "/roles",
          value: rolesRequest,
        },
      ];
      try {
        const requestOptions = {
          body: JSON.stringify({
            username: account.username,
            patchData: patchData,
          }),
        };

        const response = await fetchWithAuthorization(
          "/api/patchAccount",
          HTTP_PATCH,
          requestOptions
        );
        if (response.status === HTTP_OK) {
          const data = await response.json();
          setAccount((account) => ({
            ...account!,
            roles: data.account.roles,
          }));
          enqueueSnackbar(t(`profile.info_message.roleRevokeUser`), {
            variant: "success",
          });
          refreshTokenFunction();
          setIsUser(false);
          return;
        }
        if (response.status === HTTP_FORBIDDEN) {
          enqueueSnackbar(t(`profile.error_message.roleError`), {
            variant: "error",
          });
          return;
        }
        enqueueSnackbar(t(`profile.error_message.roleError`), {
          variant: "error",
        });
      } catch (error) {
        enqueueSnackbar(t(`profile.error_message.roleError`), {
          variant: "error",
        });
      }
    }
  };

  const handleRevokeVolunteer = async (event: React.FormEvent) => {
    event.preventDefault();
    if (account) {
      let index = rolesRequest.indexOf(CLIENT_VOLUNTEER);
      if (index !== -1) {
        rolesRequest.splice(index, 1);
      }
      const patchData = [
        {
          op: "add",
          path: "/roles",
          value: rolesRequest,
        },
      ];
      try {
        const requestOptions = {
          body: JSON.stringify({
            username: account.username,
            patchData: patchData,
          }),
        };

        const response = await fetchWithAuthorization(
          "/api/patchAccount",
          HTTP_PATCH,
          requestOptions
        );
        if (response.status === HTTP_OK) {
          const data = await response.json();
          setAccount((account) => ({
            ...account!,
            roles: data.account.roles,
          }));
          enqueueSnackbar(t(`profile.info_message.roleRevokeVolunteer`), {
            variant: "success",
          });
          refreshTokenFunction();
          setIsVolunteer(false);
          return;
        }
        if (response.status === HTTP_FORBIDDEN) {
          enqueueSnackbar(t(`profile.error_message.roleError`), {
            variant: "error",
          });
          return;
        }
        enqueueSnackbar(t(`profile.error_message.roleError`), {
          variant: "error",
        });
      } catch (error) {
        enqueueSnackbar(t(`profile.error_message.roleError`), {
          variant: "error",
        });
      }
    }
  };

  const handleBecomeVolunteer = async (event: React.FormEvent) => {
    event.preventDefault();
    if (account) {
      rolesRequest.push(CLIENT_VOLUNTEER);
      const patchData = [
        {
          op: "add",
          path: "/roles",
          value: rolesRequest,
        },
      ];
      try {
        const requestOptions = {
          body: JSON.stringify({
            username: account.username,
            patchData: patchData,
          }),
        };

        const response = await fetchWithAuthorization(
          "/api/patchAccount",
          HTTP_PATCH,
          requestOptions
        );
        if (response.status === HTTP_OK) {
          const data = await response.json();
          setAccount((account) => ({
            ...account!,
            roles: data.account.roles,
          }));
          enqueueSnackbar(t(`profile.info_message.roleBecomeVolunteer`), {
            variant: "success",
          });
          refreshTokenFunction();
          setIsVolunteer(true);
          return;
        }
        if (response.status === HTTP_FORBIDDEN) {
          enqueueSnackbar(t(`profile.error_message.roleError`), {
            variant: "error",
          });
          return;
        }
        enqueueSnackbar(t(`profile.error_message.roleError`), {
          variant: "error",
        });
      } catch (error) {
        enqueueSnackbar(t(`profile.error_message.roleError`), {
          variant: "error",
        });
      }
    }
  };

  const renderLoading = () => (
    <Box sx={{ display: "flex", alignItems: "center" }}>
      <CircularProgress sx={{ marginRight: 2 }} />
      <p>{t(`profile.loading`)}</p>
    </Box>
  );

  const renderError = () => <p>{error}</p>;

  const getContentToDisplay = () => {
    if (account)
      return (
        <Grid container spacing={2} justifyContent="center">
          <Grid container spacing={2} item xs={12}>
            <Grid item xs={5}>
              <div
                style={{
                  width: 120,
                  height: 120,
                  borderRadius: "50%",
                  background: primary,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  fontSize: "2rem",
                }}
              >
                {`${account.firstName.charAt(0)}${account.lastName.charAt(
                  0
                )}`.toUpperCase()}
              </div>
            </Grid>
            <Grid item xs={7}>
              <Grid
                container
                spacing={2}
                justifyContent="flex-start"
                alignItems="flex-end"
              >
                <Grid item xs={12}>
                  <Button
                    color="error"
                    variant="contained"
                    onClick={
                      isVolunteer
                        ? handleRevokeVolunteer
                        : handleBecomeVolunteer
                    }
                    sx={{
                      bgcolor: isVolunteer ? error : primary,
                      "&:hover": {
                        bgcolor: isVolunteer ? errorClick : secondary,
                      },
                      whiteSpace: "normal",
                      wordBreak: "break-word",
                      display: "block",
                      width: "100%",
                    }}
                  >
                    {isVolunteer
                      ? t("profile.revokeVolunteer")
                      : t("profile.becomeVolunteer")}
                  </Button>
                </Grid>

                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    color="error"
                    onClick={isUser ? handleRevokeUser : handleBecomeUser}
                    sx={{
                      mt: 0,
                      mb: 2,
                      bgcolor: isUser ? error : primary,
                      "&:hover": {
                        bgcolor: isUser ? errorClick : secondary,
                      },
                      whiteSpace: "normal",
                      wordBreak: "break-word",
                      display: "block",
                      width: "100%",
                    }}
                  >
                    {isUser ? t("profile.revokeUser") : t("profile.becomeUser")}
                  </Button>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12}>
            <Typography component="h1" variant="h5">
              {account.username}
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                borderRadius: 4,
                "&:hover": {
                  backgroundColor: editMode ? "transparent" : background,
                },
                width: editMode ? "auto" : "fit-content",
              }}
              onClick={handleEditEmail}
            >
              <EmailIcon sx={{ fontSize: "1.2rem", marginRight: 1 }} />
              {editMode ? (
                <input
                  type="text"
                  value={editedEmail}
                  onChange={(e) => setEditedEmail(e.target.value)}
                  style={{
                    border: "none",
                    outline: "none",
                    backgroundColor: background,
                    fontSize: "1rem",
                  }}
                />
              ) : (
                <Typography
                  variant="body1"
                  sx={{
                    flexGrow: 1,
                  }}
                >
                  {account.email}
                </Typography>
              )}
            </Box>
          </Grid>
          {editMode ? (
            <Grid item xs={12}>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <IconButton onClick={handleConfirmEmailChange}>
                  <CheckIcon style={{ color: icon }} />
                </IconButton>
                <IconButton onClick={handleCancelEmailChange}>
                  <CloseIcon style={{ color: icon }} />
                </IconButton>
              </Box>
            </Grid>
          ) : null}

          <Grid item xs={12}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-start",
                gap: "8px",
                flexWrap: "wrap",
              }}
            >
              {account.roles.map((role) => (
                <Chip
                  key={role}
                  label={t(
                    `profile.role.${role.replace("CLIENT_", "").toLowerCase()}`
                  )}
                />
              ))}
            </Box>
          </Grid>

          <Grid item xs={12}>
            <PrimaryButton
              onClick={handleChangePassword}
              width="183px"
              color={primary}
              hoverColor={secondary}
            >
              {t("profile.changePassword")}
            </PrimaryButton>
          </Grid>
        </Grid>
      );
  };

  const renderContent = () => {
    if (loading) {
      return renderLoading();
    } else if (error) {
      return renderError();
    } else if (account) {
      return getContentToDisplay();
    } else {
      router.push("/login");
      return null;
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: "2vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {renderContent()}
      </Box>
    </Container>
  );
}

export async function getStaticProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["profile", "navbar"])),
    },
  };
}

export default Profile;
