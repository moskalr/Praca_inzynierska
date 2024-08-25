import {
  Dialog,
  DialogContent,
  DialogTitle,
  Link,
  Typography,
} from "@mui/material";
import Button from "@mui/material/Button";
import { useRouter } from "next/router";
import { useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import { HTTP_POST } from "../../../constants/httpMethods";
import { CLIENT_GUEST } from "../../../constants/roles";
import { EventMZWO } from "../../../type/mzwo";
import fetchWithAuthorization from "../../../utils/axios/fetchWrapper";
import snackbar from "../../../utils/snackbar/snackbar";
import { UserContext } from "../../context/UserContextProvider";

const dictionary = "events";
const remove = "REMOVE";
const add = "ADD";

interface SignUpFooterProps {
  event: EventMZWO;
  isParticipant: boolean;
  setIsParticipant: (isParticipant: boolean) => void;
}

function SignUpFooter({
  event,
  isParticipant,
  setIsParticipant,
}: SignUpFooterProps) {
  const { t } = useTranslation(dictionary);
  const router = useRouter();
  const id = router.query.id;
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { currentRole, usernameAccount } = useContext(UserContext);

  const handleButtonClick = async () => {
    try {
      const action = isParticipant ? remove : add;

      const response = await fetchWithAuthorization(
        `/api/events-announcements/events/signUp?id=${event.id}&action=${action}`,
        HTTP_POST
      );

      if (response.ok) {
        setIsParticipant(!isParticipant);
        return;
      }
      if (action === remove) {
        snackbar("snackbar.errorMessage.signOff", "error", t);
      }
      snackbar("snackbar.errorMessage.signUp", "error", t);
    } catch (error) {
      snackbar("snackbar.errorMessage.default", "error", t);
    }
  };

  const handledialogOpen = () => {
    setIsDialogOpen((prev) => !prev);
  };

  return (
    <>
      <Button
        sx={{ position: "fixed", bottom: 0, width: "100%", height: "6%" }}
        variant="contained"
        color={isParticipant ? "secondary" : "primary"}
        onClick={
          currentRole === CLIENT_GUEST ? handledialogOpen : handleButtonClick
        }
      >
        {isParticipant ? t("events.button.signOff") : t("events.button.signUp")}
      </Button>
      <Dialog open={isDialogOpen} onClose={handledialogOpen}>
        <DialogTitle>{t("events.button.signUp")}</DialogTitle>
        <DialogContent>
          <Typography>{t("events.dialog.logInFirst")}</Typography>
          <Link sx={{ color: "secondary.main" }} href={`/login`}>
            {t("events.dialog.toLogIn")}
          </Link>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default SignUpFooter;
