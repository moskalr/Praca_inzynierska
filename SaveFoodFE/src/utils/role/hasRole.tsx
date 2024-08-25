import Cookies from "js-cookie";
import jwt_decode from "jwt-decode";
import { useTranslation } from "next-i18next";
import { useMemo } from "react";
import { TOKEN } from "../../constants/variables";

export const hasRole = (role: string) => {
  const dictionary = "role";
  const { t } = useTranslation(dictionary);
  const token = Cookies.get(TOKEN);
  if (token) {
    try {
      const decodedToken: any = useMemo(() => jwt_decode(token), [token]);
      const userRoles = decodedToken.resource_access.food_rescue.roles;
      return userRoles.includes(role);
    } catch (error) {
      return null;
    }
  }

  return false;
};
