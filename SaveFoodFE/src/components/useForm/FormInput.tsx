import InputAdornment from "@mui/material/InputAdornment";
import TextField from "@mui/material/TextField";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import Tooltip from "@mui/material/Tooltip";
import { useTranslation } from "next-i18next";

const FormInput = (props: {
  [x: string]: any;
  type: string;
  label: string;
  errorMessage: any;
  onBlur: any;
  id: any;
}) => {
  const {
    name,
    type,
    label,
    errorMessage,
    onBlur,
    id,
    dictionary,
    ...inputProps
  } = props;
  const { t } = useTranslation(dictionary);
  const isPasswordInput = name === "password";

  return (
    <>
      <TextField
        margin="normal"
        required
        fullWidth
        {...{ name, type, label, onBlur }}
        InputProps={
          isPasswordInput
            ? {
                endAdornment: (
                  <InputAdornment position="end">
                    <Tooltip title={t("error_message.password")} arrow>
                      <InfoOutlinedIcon style={{ color: "#54a5a5" }} />
                    </Tooltip>
                  </InputAdornment>
                ),
              }
            : {}
        }
        sx={{
          "& .MuiOutlinedInput-root": {
            "& fieldset": {
              borderColor: "#54a5a5",
              borderWidth: 2,
            },
            "&:hover fieldset": {
              borderColor: "#54a5a5",
            },
            "&.Mui-focused fieldset": {
              borderColor: "#54a5a5",
            },
          },
          "& .MuiInputLabel-root": {
            color: "#54a5a5",
            "&.Mui-focused": {
              color: "#54a5a5",
            },
          },
        }}
      ></TextField>
      {errorMessage && (
        <span style={{ color: "#c4164a" }}>{t(errorMessage)}</span>
      )}
    </>
  );
};

export default FormInput;
