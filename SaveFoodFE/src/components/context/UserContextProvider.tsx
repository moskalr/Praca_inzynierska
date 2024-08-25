import { createContext, useEffect, useState } from "react";
import jwt_decode from "jwt-decode";
import Cookies from "js-cookie";
import { CLIENT_GUEST } from "../../constants/roles";
import { TOKEN } from "../../constants/variables";

export const UserContext = createContext({
  currentRole: CLIENT_GUEST,
  handleCurrentRoleChange: (role: string) => {},
  usernameAccount: "",
});

export const UserContextProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const accessToken = Cookies.get(TOKEN);
  const storedEncodedRole = Cookies.get("userRole") || btoa(CLIENT_GUEST);
  const [currentRole, setCurrentRole] = useState(atob(storedEncodedRole));

  const decodedToken = accessToken
    ? jwt_decode<{ preferred_username: string }>(accessToken)
    : null;
  const usernameAccount = decodedToken?.preferred_username || "";

  useEffect(() => {
    const encodedRole = btoa(currentRole);
    Cookies.set("userRole", encodedRole);
  }, [currentRole]);

  return (
    <UserContext.Provider
      value={{
        currentRole,
        handleCurrentRoleChange: (role: string) => {
          setCurrentRole(role);
        },
        usernameAccount,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
