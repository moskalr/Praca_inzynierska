import { createTheme } from "@mui/material";
import { appWithTranslation } from "next-i18next";
import { AppProps } from "next/app";
import { SnackbarProvider } from "notistack";
import { GlobalContextProvider } from "../components/context/GlobalContextProvider";
import Navbar from "../components/navbar/Navbar";
import "../styles/globale.css";
import SnackbarCloseButton from "../components/buttons/SnackbarCloseButton";

function SaveFood({ Component, pageProps }: AppProps) {
  const theme = createTheme({
    palette: {
      primary: {
        main: "#970526",
      },
      secondary: {
        main: "#54a5a5",
      },
    },
  });

  return (
    <GlobalContextProvider>
      <SnackbarProvider
        maxSnack={3}
        action={(snackbarKey) => (
          <SnackbarCloseButton snackbarKey={snackbarKey} />
        )}
      >
        <Navbar />
        <Component {...pageProps} />
      </SnackbarProvider>
    </GlobalContextProvider>
  );
}

export default appWithTranslation(SaveFood);
