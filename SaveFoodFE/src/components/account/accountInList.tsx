import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  Checkbox,
  Chip,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormLabel,
  Switch,
  Tooltip,
  Typography,
} from "@mui/material";
import { enqueueSnackbar } from "notistack";
import React, { useState } from "react";
import ReactCountryFlag from "react-country-flag";
import { useAppTranslation } from "../../utils/translation/translationWrapper";
import { accountsDictionary } from "../../constants/dictionary";
import { Account } from "../../type/account";
import {
  CLIENT_ADMIN,
  CLIENT_MANAGER,
  CLIENT_MODERATOR,
  CLIENT_USER,
  CLIENT_VOLUNTEER,
} from "../../constants/roles";
import fetchWithAuthorization from "../../utils/axios/fetchWrapper";
import { HTTP_PATCH } from "../../constants/httpMethods";
import {
  HTTP_CONFLICT,
  HTTP_FORBIDDEN,
  HTTP_OK,
} from "../../constants/httpCodes";
import {
  accordionBackground,
  accordionDisabled,
  greenColorOfLetters,
  primary,
  redColorOfLetters,
  secondary,
} from "../../constants/colors";
import { LANG_PL } from "../../constants/variables";

export default function AccountInList(account: Account) {
  const t = useAppTranslation(accountsDictionary);
  const [isEnabledAccount, setIsEnabledAccount] = useState(account.isEnabled);
  const [roles, setRoles] = useState(account.roles);
  const [roleState, setRoleState] = useState({
    isUser: account.roles.includes(CLIENT_USER),
    isVolunteer: account.roles.includes(CLIENT_VOLUNTEER),
    isManager: account.roles.includes(CLIENT_MANAGER),
    isModerator: account.roles.includes(CLIENT_MODERATOR),
    isAdmin: account.roles.includes(CLIENT_ADMIN),
  });
  const { isUser, isVolunteer, isManager, isModerator, isAdmin } = roleState;
  const [rolesAccount, setRolesAccount] = useState(
    JSON.parse(JSON.stringify(roles))
  );
  const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (event.target.checked) {
        rolesAccount.push(event.target.name);
        setRoleState({
          isUser: rolesAccount.includes(CLIENT_USER),
          isVolunteer: rolesAccount.includes(CLIENT_VOLUNTEER),
          isManager: rolesAccount.includes(CLIENT_MANAGER),
          isModerator: rolesAccount.includes(CLIENT_MODERATOR),
          isAdmin: rolesAccount.includes(CLIENT_ADMIN),
        });
        return;
      }
      if (!event.target.checked) {
        let index = rolesAccount.indexOf(event.target.name);
        if (index !== -1) {
          rolesAccount.splice(index, 1);
          setRoleState({
            isUser: rolesAccount.includes(CLIENT_USER),
            isVolunteer: rolesAccount.includes(CLIENT_VOLUNTEER),
            isManager: rolesAccount.includes(CLIENT_MANAGER),
            isModerator: rolesAccount.includes(CLIENT_MODERATOR),
            isAdmin: rolesAccount.includes(CLIENT_ADMIN),
          });
        }
        return;
      }
      enqueueSnackbar(
        t(
          event.target.checked
            ? `error_message.roleRemoveError`
            : `error_message.roleAddError`
        ),
        {
          variant: "error",
        }
      );
      return;
    } catch (error) {
      enqueueSnackbar(t(`error_message.roleChangeError`), {
        variant: "error",
      });
    }
  };

  const sendRequest = async (event: React.FormEvent) => {
    event.preventDefault();
    const patchData = [
      {
        op: "add",
        path: "/roles",
        value: rolesAccount,
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

        setRoles(data.account.roles);
        setRoleState({
          isUser: data.account.roles.includes(CLIENT_USER),
          isVolunteer: data.account.roles.includes(CLIENT_VOLUNTEER),
          isManager: data.account.roles.includes(CLIENT_MANAGER),
          isModerator: data.account.roles.includes(CLIENT_MODERATOR),
          isAdmin: data.account.roles.includes(CLIENT_ADMIN),
        });
        enqueueSnackbar(t(`success_message.roleChange`), {
          variant: "success",
        });
        return;
      }
      if (response.status === HTTP_FORBIDDEN) {
        enqueueSnackbar(t(`error_message.roleForbiddenError`), {
          variant: "error",
        });
        return;
      }
      enqueueSnackbar(t(`error_message.roleChangeError`), {
        variant: "error",
      });
    } catch (error) {
      enqueueSnackbar(t(`error_message.roleChangeError`), {
        variant: "error",
      });
    }
  };

  const errorCheckBox = () => {
    return (
      [isUser, isVolunteer, isManager, isModerator, isAdmin].filter((v) => v)
        .length == 1
    );
  };

  const handleEnable = async (
    username: string,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const patchData = [
      {
        op: "replace",
        path: "/isEnabled",
        value: event.target.checked,
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
        setIsEnabledAccount(data.account.isEnabled);
        enqueueSnackbar(
          t(
            isEnabledAccount
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
            isEnabledAccount
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
          isEnabledAccount
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
    <Accordion
      sx={{
        width: "90vw",
        backgroundColor: isEnabledAccount
          ? accordionBackground
          : accordionDisabled,
      }}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography>{account.username}</Typography>
      </AccordionSummary>
      <AccordionDetails sx={{ paddingLeft: "20px" }}>
        <h2 style={{ paddingLeft: "10px", marginBottom: "10px" }}>
          {account.firstName} {account.lastName}
          <Tooltip
            title={
              account.isEnabled
                ? t("accounts.is_enabled.enable")
                : t("accounts.is_enabled.disable")
            }
            placement="top"
          >
            {account.isEnabled ? (
              <CheckCircleOutlineIcon style={{ color: greenColorOfLetters }} />
            ) : (
              <HighlightOffIcon style={{ color: redColorOfLetters }} />
            )}
          </Tooltip>
        </h2>
        <p>{account.email}</p>
        {account.language === LANG_PL.toUpperCase() ? (
          <ReactCountryFlag countryCode="PL" svg />
        ) : (
          <ReactCountryFlag countryCode="GB" svg />
        )}
        {account.language}
        <p style={{ marginTop: "10px" }}>
          {roles.map((role: React.Key | null | undefined) => (
            <Chip
              sx={{ marginRight: "10px", marginTop: "10px" }}
              key={role}
              label={t(
                `accounts.role.${role}`.replace("CLIENT_", "").toLowerCase()
              )}
            />
          ))}
        </p>
        <Tooltip
          title={
            isEnabledAccount
              ? t("accounts.button.disable")
              : t("accounts.button.enable")
          }
          placement="top"
        >
          <>
            <label>
              {isEnabledAccount
                ? t("accounts.button.disable")
                : t("accounts.button.enable")}
            </label>
            <Switch
              checked={isEnabledAccount}
              color="success"
              onChange={(event) => handleEnable(account.username, event)}
              inputProps={{ "aria-label": "controlled" }}
            />
          </>
        </Tooltip>
        <FormControl
          required
          error={errorCheckBox()}
          component="fieldset"
          sx={{ m: 3 }}
          variant="standard"
        >
          <FormLabel component="legend">
            {t("info_message.amountRolesInfo")}
          </FormLabel>
          <FormGroup>
            <FormControlLabel
              control={
                <Checkbox
                  style={{ color: primary }}
                  checked={isUser}
                  onChange={(event) => handleChange(event)}
                  name={CLIENT_USER}
                />
              }
              label={t("accounts.role.user")}
              disabled={errorCheckBox() && isUser}
            />
            <FormControlLabel
              control={
                <Checkbox
                  style={{ color: primary }}
                  checked={isVolunteer}
                  onChange={(event) => handleChange(event)}
                  name={CLIENT_VOLUNTEER}
                />
              }
              label={t("accounts.role.volunteer")}
              disabled={errorCheckBox() && isVolunteer}
            />
            <FormControlLabel
              control={
                <Checkbox
                  style={{ color: primary }}
                  checked={isManager}
                  onChange={(event) => handleChange(event)}
                  name={CLIENT_MANAGER}
                />
              }
              label={t(`accounts.role.manager`)}
              disabled={errorCheckBox() && isManager}
            />
            <FormControlLabel
              control={
                <Checkbox
                  style={{ color: primary }}
                  checked={isModerator}
                  onChange={(event) => handleChange(event)}
                  name={CLIENT_MODERATOR}
                />
              }
              label={t("accounts.role.moderator")}
              disabled={errorCheckBox() && isModerator}
            />
            <FormControlLabel
              control={
                <Checkbox
                  style={{ color: primary }}
                  checked={isAdmin}
                  onChange={(event) => handleChange(event)}
                  name={CLIENT_ADMIN}
                />
              }
              label={t("accounts.role.admin")}
              disabled={errorCheckBox() && isAdmin}
            />
          </FormGroup>
        </FormControl>
        <Button
          variant="contained"
          color="error"
          onClick={sendRequest}
          sx={{
            mt: 0,
            mb: 2,
            bgcolor: primary,
            "&:hover": {
              bgcolor: secondary,
            },
            whiteSpace: "normal",
            wordBreak: "break-word",
            display: "block",
            width: "100%",
          }}
        >
          {t("info_message.submitRole")}
        </Button>
      </AccordionDetails>
    </Accordion>
  );
}
