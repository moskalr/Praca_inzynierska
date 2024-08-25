import { FormControlLabel, Radio, RadioGroup } from "@mui/material";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Slide from "@mui/material/Slide";
import { TransitionProps } from "@mui/material/transitions";
import Cookies from "js-cookie";
import jwt_decode from "jwt-decode";
import { useTranslation } from "next-i18next";
import Link from "next/link";
import React, { useContext, useState } from "react";
import { UserContext } from "../context/UserContextProvider";
import { TOKEN } from "../../constants/variables";

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

interface ChangeRoleProps {
  className?: string;
  textField?: any;
  dictionary?: string;
}

interface DecodedToken {
  resource_access: {
    food_rescue: {
      roles: string[];
    };
  };
}

export default function ChangeRole({
  className,
  textField,
  dictionary,
}: ChangeRoleProps) {
  const { t } = useTranslation(dictionary);
  const { currentRole, handleCurrentRoleChange } = useContext(UserContext);

  const token = Cookies.get(TOKEN);

  const userRoles = () => {
    if (token) {
      const decodedToken: DecodedToken = jwt_decode(token);
      return decodedToken.resource_access.food_rescue.roles;
    }
    return null;
  };
  const roles = userRoles();

  const [openRoleSelect, setOpenRoleSelect] = useState(false);
  const [selectedRole, setSelectedRole] = useState(currentRole);

  const handleClickOpenRoleSelect = () => {
    setOpenRoleSelect(true);
  };

  const handleCloseRoleSelect = () => {
    setOpenRoleSelect(false);
  };

  const handleConfirmRoleSelect = () => {
    handleCurrentRoleChange(selectedRole);
    handleCloseRoleSelect();
  };

  const handleCancelRoleSelect = () => {
    setSelectedRole(currentRole);
    handleCloseRoleSelect();
  };

  return (
    <>
      <Link href="" {...{ className }} onClick={handleClickOpenRoleSelect}>
        {textField}
      </Link>
      <Dialog
        open={openRoleSelect}
        TransitionComponent={Transition}
        keepMounted
        onClose={handleCloseRoleSelect}
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogTitle>{t("navbar.role.select_title")}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-slide-description">
            <RadioGroup
              aria-label="role"
              name="role"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              sx={{ color: "secondary.main" }}
            >
              {roles?.map((role: string) => (
                <FormControlLabel
                  value={role}
                  key={role}
                  control={
                    <Radio
                      sx={{
                        color: "secondary.main",
                        "&.Mui-checked": {
                          color: "secondary.main",
                        },
                      }}
                    />
                  }
                  label={t(
                    `navbar.role.${role}`.replace("CLIENT_", "").toLowerCase()
                  )}
                />
              ))}
            </RadioGroup>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleConfirmRoleSelect}
            sx={{ color: "secondary.main" }}
          >
            {t("button.ok")}
          </Button>
          <Button
            onClick={handleCancelRoleSelect}
            sx={{ color: "secondary.main" }}
          >
            {t("button.cancel")}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
