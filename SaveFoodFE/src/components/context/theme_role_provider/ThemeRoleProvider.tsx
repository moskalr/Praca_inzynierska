import { ThemeProvider } from "@emotion/react";
import { useContext } from "react";
import { UserContext } from "../UserContextProvider";
import { getCurrentTheme } from "./getCurrentTheme";

export const ThemesRoleProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { currentRole } = useContext(UserContext);
  return (
    <ThemeProvider theme={getCurrentTheme(currentRole)}>
      {children}
    </ThemeProvider>
  );
};
