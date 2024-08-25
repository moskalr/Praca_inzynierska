import { Button } from "@mui/material";
import { useTranslation } from "next-i18next";
import { primary, secondary } from "../../constants/colors";

const SubmitButton = (props: {
  [x: string]: any;
  dictionary: string;
  buttonName: string;
}) => {
  const { dictionary, buttonName, ...inputProps } = props;
  const { t } = useTranslation(dictionary);
  return (
    <Button
      type="submit"
      fullWidth
      variant="contained"
      sx={{
        mt: 3,
        mb: 2,
        bgcolor: primary,
        "&:hover": {
          bgcolor: secondary,
        },
      }}
    >
      {t(buttonName)}
    </Button>
  );
};

export default SubmitButton;
