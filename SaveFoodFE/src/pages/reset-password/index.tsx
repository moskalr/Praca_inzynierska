import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Link from "next/link";
import { enqueueSnackbar } from "notistack";
import React, { useRef, useState } from "react";
import SubmitButton from "../../components/buttons/SubmitButton";
import FormInput from "../../components/useForm/FormInput";
import { regexEmail } from "../../constants/variables";
import { HTTP_POST } from "../../constants/httpMethods";
import { HTTP_NO_CONTENT } from "../../constants/httpCodes";

const dictionary = "reset_password";

export function Reset() {
  const { t } = useTranslation(dictionary);
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState("");

  const emailInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (email !== "" && errors === "") {
      try {
        const response = await fetch("/api/resetPassword", {
          method: HTTP_POST,
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        });

        if (response.status === HTTP_NO_CONTENT) {
          enqueueSnackbar(t(`info_message.info`), { variant: "success" });
          return;
        }
        enqueueSnackbar(t(`error_message.error`), { variant: "error" });
      } catch (error) {
        enqueueSnackbar(t(`error_message.error`), { variant: "error" });
      }
    }
    enqueueSnackbar(t(`error_message.main`), { variant: "error" });
  };

  const onBlur = (value: any) => {
    setEmail(value);
    if (!regexEmail.test(value)) {
      setErrors("error_message.email");
      return;
    }
    setErrors("");
  };

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
        <Typography variant="h5">{t("reset_password.reset")}</Typography>
        <Typography variant="body1" align="center">
          {t("reset_password.instructions")}
        </Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          <FormInput
            id={1}
            value={email}
            name="email"
            type="email"
            {...{ dictionary }}
            label={t("reset_password.email")}
            errorMessage={errors}
            onBlur={(event: { currentTarget: { value: any } }) =>
              onBlur(event?.currentTarget.value)
            }
          />
          <SubmitButton
            buttonName={t("reset_password.continue")}
            {...{ dictionary }}
          />
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Link href="/login">
                <span className="custom-link">{t("reset_password.login")}</span>
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

export default Reset;
