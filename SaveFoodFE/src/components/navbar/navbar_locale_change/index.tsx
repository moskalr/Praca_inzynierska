import TranslateIcon from "@mui/icons-material/Translate";
import { IconButton } from "@mui/material";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Cookies from "js-cookie";
import jwt_decode from "jwt-decode";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import { enqueueSnackbar } from "notistack";
import { useRef, useState } from "react";
import ReactCountryFlag from "react-country-flag";
import { HTTP_OK } from "../../../constants/httpCodes";
import { HTTP_PATCH, HTTP_POST } from "../../../constants/httpMethods";
import {
  LANG_EN,
  LANG_PL,
  REFRESH_TOKEN,
  TOKEN,
} from "../../../constants/variables";
import fetchWithAuthorization from "../../../utils/axios/fetchWrapper";

export function NavbarLocaleChange() {
  const { t } = useTranslation("navbar");
  const { push } = useRouter();
  const [isLanguageOptionsOpen, setIsLanguageOptionsOpen] = useState(false);
  const buttonRef = useRef<any>(null);
  const accessToken = Cookies.get(TOKEN);
  const refreshToken = Cookies.get(REFRESH_TOKEN);

  const handleClick = () => setIsLanguageOptionsOpen((prev) => !prev);

  const handleClose = () => setIsLanguageOptionsOpen(false);

  const refreshTokenFunction = async () => {
    try {
      const requestOptions = {
        body: JSON.stringify({ refreshToken }),
      };

      const response = await fetchWithAuthorization(
        "/api/refreshToken",
        HTTP_POST,
        requestOptions
      );
      if (response.ok) {
        const data = await response.json();
        const accessToken = data.access_token;
        const refreshToken = data.refresh_token;
        Cookies.set(TOKEN, accessToken, { secure: true });
        Cookies.set(REFRESH_TOKEN, refreshToken, { secure: true });
        return;
      }
      enqueueSnackbar(t(`navbar.language.error_message.refreshToken`), {
        variant: "error",
      });
    } catch (error) {
      enqueueSnackbar(t(`navbar.language.error_message.refreshToken`), {
        variant: "error",
      });
    }
  };

  const changeLanguageFunction = async (lang: string) => {
    if (accessToken) {
      const decodedToken: any = jwt_decode(accessToken);
      if (lang.toLocaleUpperCase() === decodedToken.language) {
        enqueueSnackbar(t(`"navbar.language.error_message.sameLanguage`), {
          variant: "error",
        });
        return;
      }

      const reqUsername = decodedToken.preferred_username;
      const patchData = [
        {
          op: "replace",
          path: "/language",
          value: lang.toLocaleUpperCase(),
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
        if (response.status === HTTP_OK) {
          const data = await response.json();
          refreshTokenFunction();
          push("", undefined, { locale: data.account.language.toLowerCase() });
          handleClose();
          enqueueSnackbar(t(`"navbar.language.success`), {
            variant: "success",
          });
          return;
        }
        enqueueSnackbar(t(`"navbar.language.error_message.error`), {
          variant: "error",
        });
      } catch (error) {
        enqueueSnackbar(t(`"navbar.language.error_message.error`), {
          variant: "error",
        });
      }
      return;
    }
    push("", undefined, { locale: lang });
    handleClose();
  };

  return (
    <>
      <IconButton
        ref={buttonRef}
        className="ms-2"
        id="basic-button"
        aria-controls={isLanguageOptionsOpen ? "basic-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={isLanguageOptionsOpen ? "true" : undefined}
        onClick={handleClick}
      >
        <TranslateIcon
          sx={{ color: "secondary.main" }}
          fontSize="small"
          className="text-white"
        />
      </IconButton>
      <Menu
        id="basic-menu"
        anchorEl={buttonRef.current}
        open={isLanguageOptionsOpen}
        onClose={handleClose}
        MenuListProps={{
          "aria-labelledby": "basic-button",
        }}
      >
        <MenuItem onClick={() => changeLanguageFunction(LANG_PL)}>
          <ReactCountryFlag countryCode="PL" svg />
          &nbsp;
          {t("navbar.language.polish")}
        </MenuItem>
        <MenuItem onClick={() => changeLanguageFunction(LANG_EN)}>
          <ReactCountryFlag countryCode="GB" svg />
          &nbsp;
          {t("navbar.language.english")}
        </MenuItem>
      </Menu>
    </>
  );
}

export default NavbarLocaleChange;
