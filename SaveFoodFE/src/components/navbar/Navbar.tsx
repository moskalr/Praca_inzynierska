import CloseIcon from "@mui/icons-material/Close";
import MenuIcon from "@mui/icons-material/Menu";
import { MenuItem, Popover } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import Cookies from "js-cookie";
import { useTranslation } from "next-i18next";
import Link from "next/link";
import { enqueueSnackbar } from "notistack";
import { useContext, useEffect, useState } from "react";
import { HTTP_NO_CONTENT } from "../../constants/httpCodes";
import { HTTP_POST } from "../../constants/httpMethods";
import { CLIENT_GUEST } from "../../constants/roles";
import { REFRESH_TOKEN, TOKEN } from "../../constants/variables";
import fetchWithAuthorization from "../../utils/axios/fetchWrapper";
import ChangeRole from "../change_role/ChangeRole";
import { UserContext } from "../context/UserContextProvider";
import styles from "./Navbar.module.css";
import NavbarLocaleChange from "./navbar_locale_change";
import NavbarProfilePCMenu from "./navbar_profile_pc_menu";

const dictionary = "navbar";

export function Navbar() {
  const { t } = useTranslation(dictionary);
  const { handleCurrentRoleChange } = useContext(UserContext);
  const theme = useTheme();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobileMenuButtonVisible, setMobileMenuButtonVisible] =
    useState(true);
  const [isEaaMenuOpen, setIsEaaMenuOpen] = useState(false);
  const [eaaAnchorEl, setEaaAnchorEl] = useState(null);

  const handleClick = () => setMobileMenuOpen(!isMobileMenuOpen);
  const closeMobileMenu = () => setMobileMenuOpen(false);

  const showMobileMenuButton = () => {
    if (window != null && window.innerWidth <= 960) {
      setMobileMenuButtonVisible(false);
      return;
    }
    setMobileMenuButtonVisible(true);
  };

  const logoutFunction = async () => {
    try {
      const response = await fetchWithAuthorization("/api/logout", HTTP_POST);
      if (response.status === HTTP_NO_CONTENT) {
        Cookies.remove(TOKEN);
        Cookies.remove(REFRESH_TOKEN);
        setIsLoggedIn(false);
        closeMobileMenu();
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

  useEffect(() => {
    showMobileMenuButton();
    window.addEventListener("resize", showMobileMenuButton);
  }, []);

  useEffect(() => {
    setIsLoggedIn(!!Cookies.get(TOKEN));
  }, [Cookies.get(TOKEN)]);

  const handleEaaMenuOpen = (event: any) => {
    setIsEaaMenuOpen((prev) => !prev);
    setEaaAnchorEl(event.currentTarget);
  };

  const handleCloseEaaPopover = () => {
    setMobileMenuOpen(false);
    setIsEaaMenuOpen(false);
    setEaaAnchorEl(null);
  };

  return (
    <nav
      className={styles["navbar"]}
      style={{
        background: `${theme.palette.primary.main}`,
      }}
    >
      <div className={styles["navbar-container"]}>
        <Link
          href="/"
          className={styles["navbar-logo"]}
          onClick={closeMobileMenu}
          style={{
            color: `${theme.palette.secondary.main}`,
          }}
        >
          {t("navbar.title")}
        </Link>
        <div
          className={styles["navbar-icons"]}
          style={{
            color: `${theme.palette.primary.main}`,
          }}
        >
          <NavbarLocaleChange />
          {isLoggedIn && (
            <div
              className={styles["profile-icon"]}
              style={{
                color: `${theme.palette.primary.main}`,
              }}
            >
              <NavbarProfilePCMenu />
            </div>
          )}
        </div>
        <div className={styles["menu-icon"]} onClick={handleClick}>
          {isMobileMenuOpen ? (
            <CloseIcon fontSize="large" sx={{ color: "secondary.main" }} />
          ) : (
            <MenuIcon fontSize="large" sx={{ color: "secondary.main" }} />
          )}
        </div>
        <ul
          className={`${styles["nav-menu"]} ${
            isMobileMenuOpen ? styles.active : ""
          }`}
          style={{
            background: isMobileMenuButtonVisible
              ? "transparent"
              : `${theme.palette.primary.main}`,
          }}
        >
          <li className={styles["nav-item"]}>
            <Link
              href="/"
              className={styles["nav-links"]}
              onClick={closeMobileMenu}
              style={{
                color: `${theme.palette.secondary.main}`,
              }}
            >
              {t("navbar.home")}
            </Link>
          </li>
          <li className={styles["nav-item"]}>
            <div className={styles["nav-links"]} onClick={handleEaaMenuOpen}>
              {t("navbar.eaa.title")}
            </div>
            <Popover
              open={isEaaMenuOpen}
              anchorEl={eaaAnchorEl}
              onClose={handleCloseEaaPopover}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "center",
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "center",
              }}
            >
              <Link
                href="/events-announcements/events"
                className={styles["navbar-logo"]}
              >
                <MenuItem onClick={handleCloseEaaPopover}>
                  {t("navbar.eaa.events")}
                </MenuItem>
              </Link>
              <Link
                href="/events-announcements/announcements"
                className={styles["navbar-logo"]}
              >
                <MenuItem onClick={handleCloseEaaPopover}>
                  {t("navbar.eaa.announcements")}
                </MenuItem>
              </Link>
              {isLoggedIn && (
                <Link
                  href="/events-announcements/userPanel"
                  className={styles["navbar-logo"]}
                >
                  <MenuItem onClick={handleCloseEaaPopover}>
                    {t("navbar.eaa.userPanel")}
                  </MenuItem>
                </Link>
              )}
            </Popover>
          </li>
          {!isLoggedIn ? (
            <li className={styles["nav-item"]}>
              <Link
                href="/social-fridges"
                className={styles["nav-links"]}
                onClick={closeMobileMenu}
              >
                {t("navbar.social_fridges")}
              </Link>
            </li>
          ) : null}
          {!isLoggedIn ? (
            <li className={styles["nav-item"]}>
              <Link
                href="/login"
                className={styles["nav-links-mobile"]}
                onClick={closeMobileMenu}
              >
                {t("navbar.login")}
              </Link>
            </li>
          ) : (
            <>
              <li className={styles["nav-item"]}>
                <Link
                  href="/profile"
                  className={styles["nav-links-logedin"]}
                  onClick={closeMobileMenu}
                >
                  {t("navbar.profile")}
                </Link>
              </li>
              <li className={styles["nav-item"]} onClick={closeMobileMenu}>
                <ChangeRole
                  {...{ dictionary }}
                  className={styles["nav-links-logedin"]}
                  textField={t("navbar.change_role")}
                />
              </li>
              <li className={styles["nav-item"]}>
                <Link
                  href="/private-fridges"
                  className={styles["nav-links-logedin"]}
                  onClick={closeMobileMenu}
                >
                  {t("navbar.private_fridges")}
                </Link>
              </li>
              <li className={styles["nav-item"]}>
                <Link
                  href="/social-fridges"
                  className={styles["nav-links-logedin"]}
                  onClick={closeMobileMenu}
                >
                  {t("navbar.social_fridges")}
                </Link>
              </li>
              <li className={styles["nav-item"]}>
                <Link
                  href=""
                  className={styles["nav-links-logedin"]}
                  onClick={logoutFunction}
                >
                  {t("navbar.logout")}
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;
