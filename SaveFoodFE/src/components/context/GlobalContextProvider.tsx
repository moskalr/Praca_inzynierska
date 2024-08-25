import { ThemesRoleProvider } from "./theme_role_provider/ThemeRoleProvider";
import { UserContextProvider } from "./UserContextProvider";

export const GlobalContextProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <UserContextProvider>
      <ThemesRoleProvider>{children}</ThemesRoleProvider>
    </UserContextProvider>
  );
};
