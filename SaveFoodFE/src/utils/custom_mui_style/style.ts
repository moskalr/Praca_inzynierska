import { secondary } from "../../constants/colors";

export const outlinedInputStyles = {
  "& .MuiOutlinedInput-root": {
    "& fieldset": {
      borderColor: secondary,
      borderWidth: 2,
    },
    "&:hover fieldset": {
      borderColor: secondary,
    },
    "&.Mui-focused fieldset": {
      borderColor: secondary,
    },
  },
};
