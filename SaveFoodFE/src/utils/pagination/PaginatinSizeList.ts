import { useMediaQuery, useTheme } from "@mui/material";

export const paginationSizeList = () => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const isMediumScreen = useMediaQuery(theme.breakpoints.between("sm", "lg"));

  if (isSmallScreen) {
    return 8;
  }
  if (isMediumScreen) {
    return 16;
  }
  return 24;
};
