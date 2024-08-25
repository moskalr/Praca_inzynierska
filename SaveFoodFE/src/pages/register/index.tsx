import AccessibilityNewIcon from "@mui/icons-material/AccessibilityNew";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import VolunteerActivismIcon from "@mui/icons-material/VolunteerActivism";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Link from "next/link";
import { useRouter } from "next/router";
import { enqueueSnackbar } from "notistack";
import * as React from "react";
import { useState } from "react";
import ReactCountryFlag from "react-country-flag";
import ExternalIcon from "../../components/avatar/ExternalIcon";
import SubmitButton from "../../components/buttons/SubmitButton";
import ParameterizedSelect from "../../components/parameterized_select/ParameterizedSelect";
import FormInput from "../../components/useForm/FormInput";
import { CLIENT_USER } from "../../constants/roles";
import {
  LANG_PL,
  regexEmail,
  regexName,
  regexPassword,
  regexUsername,
} from "../../constants/variables";
import { HTTP_POST } from "../../constants/httpMethods";
import { HTTP_CREATED } from "../../constants/httpCodes";

const dictionary = "register";

export function Register() {
  const { t } = useTranslation(dictionary);
  const { push } = useRouter();
  type FormValues = Record<string, string>;

  const [lang, setLang] = useState(LANG_PL.toUpperCase());
  const [role, setRole] = useState(CLIENT_USER);

  const [values, setValues] = useState<FormValues>({
    username: "",
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<FormValues>({
    username: "",
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const inputs = [
    {
      id: 1,
      name: "username",
      type: "text",
      placeHolder: t("register.username"),
      label: t("register.username"),
      errorMessage: "error_message.username",
      regex: regexUsername,
    },
    {
      id: 2,
      name: "firstName",
      type: "text",
      placeHolder: t("register.first_name"),
      label: t("register.first_name"),
      errorMessage: "error_message.first_name",
      regex: regexName,
    },
    {
      id: 3,
      name: "lastName",
      type: "text",
      placeHolder: t("register.surname"),
      label: t("register.surname"),
      errorMessage: "error_message.surname",
      regex: regexName,
    },
    {
      id: 4,
      name: "email",
      type: "email",
      placeHolder: t("register.email"),
      label: t("register.email"),
      errorMessage: "error_message.email",
      regex: regexEmail,
    },
    {
      id: 5,
      name: "password",
      type: "password",
      placeHolder: t("register.password"),
      label: t("register.password"),
      errorMessage: "error_message.password",
      regex: regexPassword,
    },
    {
      id: 6,
      name: "confirmPassword",
      type: "password",
      placeHolder: t("register.confirm_password"),
      label: t("register.confirm_password"),
      errorMessage: "error_message.confirm_password",
      regex: regexPassword,
    },
  ];

  const onBlur = (input: any, value: any) => {
    setValues({ ...values, [input.name]: value });
    if (input.name === "confirmPassword" && value !== values.password) {
      setErrors({ ...errors, [input.name]: input.errorMessage });
      return;
    }
    if (!input.regex.test(value)) {
      setErrors({ ...errors, [input.name]: input.errorMessage });
      return;
    }
    setErrors({ ...errors, [input.name]: "" });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (
      Object.values(values).filter((element) => element === "").length === 0 &&
      Object.values(errors).filter((element) => element !== "").length === 0
    ) {
      const data = {
        username: values.username,
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        password: values.password,
        language: lang,
        role: role,
      };
      try {
        const response = await fetch("/api/register", {
          method: HTTP_POST,
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });
        if (response.status === HTTP_CREATED) {
          enqueueSnackbar(t(`success_message.success`), {
            variant: "success",
          });
          push("/login");
          return;
        }
      } catch (error) {
        enqueueSnackbar(t(`error_message.error`), { variant: "error" });
      }
      return;
    }
    enqueueSnackbar(t(`error_message.main`), { variant: "error" });
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
        <ExternalIcon icon={<LockOutlinedIcon />} />
        <Typography component="h1" variant="h5">
          {t("register.title")}
        </Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          {inputs.map((input) => (
            <FormInput
              key={input.id}
              {...input}
              value={values[input.name]}
              errorMessage={errors[input.name]}
              {...{ dictionary }}
              onBlur={(event: { currentTarget: { value: any } }) =>
                onBlur(input, event?.currentTarget.value)
              }
            />
          ))}
          <ParameterizedSelect
            label={t("register.language")}
            defaultValue="PL"
            fmiLabel={t("register.polish")}
            smiLabel={t("register.english")}
            secondValue="EN"
            onChange={(event: {
              target: { value: React.SetStateAction<string> };
            }) => {
              setLang(event.target.value);
            }}
            firstIcon={<ReactCountryFlag countryCode="PL" svg />}
            secondIcon={<ReactCountryFlag countryCode="GB" svg />}
          />
          <ParameterizedSelect
            label={t("register.role.title")}
            defaultValue="CLIENT_USER"
            fmiLabel={t("register.role.user")}
            smiLabel={t("register.role.volunteer")}
            secondValue="CLIENT_VOLUNTEER"
            onChange={(event: {
              target: { value: React.SetStateAction<string> };
            }) => {
              setRole(event.target.value);
            }}
            firstIcon={
              <AccessibilityNewIcon
                fontSize="small"
                sx={{ color: "#0f7373" }}
              />
            }
            secondIcon={
              <VolunteerActivismIcon
                fontSize="small"
                sx={{ color: "#0f7373" }}
              />
            }
          />
          <SubmitButton buttonName={t("register.title")} {...{ dictionary }} />
          <Grid container>
            <Grid item xs></Grid>
            <Grid item>
              <Link href="/login">
                <span className="custom-link">{t("register.old_account")}</span>
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

export default Register;
