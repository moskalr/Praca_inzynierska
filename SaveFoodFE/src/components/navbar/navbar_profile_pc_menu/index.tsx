import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import {
  Box,
  Divider,
  Grid,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Cookies from "js-cookie";
import { useTranslation } from "next-i18next";
import Link from "next/link";
import { enqueueSnackbar } from "notistack";
import { useContext, useRef, useState } from "react";
import ExternalIcon from "../../../components/avatar/ExternalIcon";
import ChangeRole from "../../../components/change_role/ChangeRole";
import { UserContext } from "../../../components/context/UserContextProvider";
import { HTTP_NO_CONTENT } from "../../../constants/httpCodes";
import { HTTP_POST } from "../../../constants/httpMethods";
import { CLIENT_GUEST } from "../../../constants/roles";
import { REFRESH_TOKEN, TOKEN } from "../../../constants/variables";
import fetchWithAuthorization from "../../../utils/axios/fetchWrapper";
import styles from "../Navbar.module.css";

const dictionary = "navbar";

export function NavbarProfilePCMenu() {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { t } = useTranslation(dictionary);
  const { handleCurrentRoleChange, currentRole, usernameAccount } =
    useContext(UserContext);

  const buttonRef = useRef<any>(null);

  const handleClick = () => setIsProfileMenuOpen((prev) => !prev);

  const handleClose = () => setIsProfileMenuOpen(false);

  const logoutFunction = async () => {
    try {
      const response = await fetchWithAuthorization("/api/logout", HTTP_POST);
      if (response.status === HTTP_NO_CONTENT) {
        Cookies.remove(TOKEN);
        Cookies.remove(REFRESH_TOKEN);
        setIsLoggedIn(false);
        handleClose();
        enqueueSnackbar(t(`logout.info_message`), {
          variant: "success",
        });
        handleCurrentRoleChange(CLIENT_GUEST);
        return;
      }
      enqueueSnackbar(t(`logout.error_message`), {
        variant: "error",
      });
    } catch (error) {
      enqueueSnackbar(t(`logout.error_message`), {
        variant: "error",
      });
    }
  };

  return (
    <Grid container>
      <Grid item>
        <IconButton
          ref={buttonRef}
          className="ms-2"
          id="basic-button"
          aria-controls={isProfileMenuOpen ? "basic-menu" : undefined}
          aria-haspopup="true"
          aria-expanded={isProfileMenuOpen ? "true" : undefined}
          onClick={handleClick}
        >
          <ExternalIcon
            icon={
              <AccountCircleIcon
                sx={{ fontSize: "40px", backgroundColor: "secondary.main" }}
              />
            }
          />
        </IconButton>
      </Grid>
      <Grid item>
        <Box>
          <Stack marginTop="3vh">
            <Typography color="secondary.main" variant="caption">
              @{usernameAccount}
            </Typography>
            <Divider />
            <Typography color="black" variant="caption">
              {t(`navbar.roles.${currentRole.toLowerCase()}`)}
            </Typography>
          </Stack>
        </Box>
      </Grid>
      <Menu
        id="basic-menu"
        anchorEl={buttonRef.current}
        open={isProfileMenuOpen}
        onClose={handleClose}
        MenuListProps={{
          "aria-labelledby": "basic-button",
        }}
      >
        <Link
          href="/profile"
          className={styles["navbar-logo"]}
          onClick={handleClose}
        >
          <MenuItem sx={{ width: "100%" }}>{t("navbar.profile")}</MenuItem>
        </Link>
        <ChangeRole
          {...{ dictionary }}
          className={styles["navbar-logo"]}
          textField={
            <MenuItem sx={{ width: "100%" }}>
              {t("navbar.change_role")}
            </MenuItem>
          }
        />
        <Link
          href="/private-fridges"
          className={styles["navbar-logo"]}
          onClick={handleClose}
        >
          <MenuItem sx={{ width: "100%" }}>
            {t("navbar.private_fridges")}
          </MenuItem>
        </Link>
        <Link
          href="/social-fridges"
          className={styles["navbar-logo"]}
          onClick={handleClose}
        >
          <MenuItem sx={{ width: "100%" }}>
            {t("navbar.social_fridges")}
          </MenuItem>
        </Link>
        <Link
          href="/"
          className={styles["navbar-logo"]}
          onClick={logoutFunction}
        >
          <MenuItem sx={{ width: "100%" }}>{t("navbar.logout")}</MenuItem>
        </Link>
      </Menu>
    </Grid>
  );
}

export default NavbarProfilePCMenu;
