import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Checkbox from "@mui/material/Checkbox";
import Container from "@mui/material/Container";
import FormControlLabel from "@mui/material/FormControlLabel";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Cookies from "js-cookie";
import jwt_decode from "jwt-decode";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Link from "next/link";
import { useRouter } from "next/router";
import { enqueueSnackbar } from "notistack";
import * as React from "react";
import { useContext, useState } from "react";
import SubmitButton from "../../components/buttons/SubmitButton";
import { UserContext } from "../../components/context/UserContextProvider";
import FormInput from "../../components/useForm/FormInput";
import { primary, secondary } from "../../constants/colors";
import { HTTP_POST } from "../../constants/httpMethods";
import { REFRESH_TOKEN, TOKEN } from "../../constants/variables";
import fetchWithAuthorization from "../../utils/axios/fetchWrapper";

const dictionary = "login";

interface DecodedToken {
  resource_access: {
    food_rescue: {
      roles: string[];
    };
  };
  language: string;
}

export function Login() {
  const { t } = useTranslation(dictionary);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState("");
  const { push } = useRouter();
  const { handleCurrentRoleChange } = useContext(UserContext);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      const requestOptions = {
        body: JSON.stringify({ username, password }),
      };

      const response = await fetchWithAuthorization(
        "/api/login",
        HTTP_POST,
        requestOptions
      );

      if (response.ok) {
        const data = await response.json();
        const accessToken = data.access_token;
        const refreshToken = data.refresh_token;
        const decodedToken: DecodedToken = jwt_decode(accessToken);
        const language = decodedToken.language;
        const userRoles = decodedToken.resource_access.food_rescue.roles;
        const firstUserRole: string | undefined =
          userRoles && userRoles.length > 0 ? userRoles[0] : undefined;
        if (firstUserRole !== undefined) {
          handleCurrentRoleChange(firstUserRole);
        }
        Cookies.set(TOKEN, accessToken, { secure: true });
        Cookies.set(REFRESH_TOKEN, refreshToken, { secure: true });
        enqueueSnackbar(t(`success_message.success`), { variant: "success" });
        push("/", undefined, { locale: language.toLowerCase() });
        return;
      }
      enqueueSnackbar(t(`error_message.error`), { variant: "error" });
    } catch (error) {
      enqueueSnackbar(t(`error_message.default_error`), { variant: "error" });
    }
  };

  const onBlurUsername = (value: any) => {
    setUsername(value);
    setErrors("");
  };

  const onBlurPassword = (value: any) => {
    setPassword(value);
    setErrors("");
  };

  const [rememberMe, setRememberMe] = useState(false);

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: "20vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Avatar sx={{ m: 1, bgcolor: primary }}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          {t("login.title")}
        </Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          <FormInput
            id={0}
            name="username"
            type="text"
            label={t("login.username")}
            errorMessage=""
            onBlur={(event: { currentTarget: { value: any } }) =>
              onBlurUsername(event?.currentTarget.value)
            }
            {...{ dictionary }}
          />
          <FormInput
            id={1}
            name="password"
            type="password"
            label={t("login.password")}
            errorMessage=""
            onBlur={(event: { currentTarget: { value: any } }) =>
              onBlurPassword(event?.currentTarget.value)
            }
            {...{ dictionary }}
          />
          <FormControlLabel
            control={
              <Checkbox
                value="remember"
                color="primary"
                checked={rememberMe}
                sx={{
                  color: primary,
                  "&.Mui-checked": {
                    color: secondary,
                  },
                }}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
            }
            label={t("login.remember_me")}
          />
          <SubmitButton buttonName={t("login.sign_in")} {...{ dictionary }} />
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Link href="/reset-password">
                <span className="custom-link">
                  {t("login.forgot_password")}
                </span>
              </Link>
            </Grid>
            <Grid item xs={6}>
              <Link href="/register">
                <span className="custom-link">{t("login.old_user")}</span>
              </Link>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Container>
  );
}

export async function getStaticProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, [dictionary, "navbar"])),
    },
  };
}

export default Login;
