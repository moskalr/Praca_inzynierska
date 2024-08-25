import Cookies from "js-cookie";
import router from "next/router";
import {
  HTTP_GET,
  HTTP_PATCH,
  HTTP_POST,
  HTTP_PUT,
} from "../../constants/httpMethods";
import { TOKEN } from "../../constants/variables";

type HttpMethod =
  | typeof HTTP_GET
  | typeof HTTP_POST
  | typeof HTTP_PATCH
  | typeof HTTP_PUT;

const getAuthToken = () => {
  const accessToken = Cookies.get(TOKEN);
  if (accessToken) {
    return `${accessToken}`;
  }
  return "";
};

const fetchWithAuthorization = (
  url: string,
  method: HttpMethod,
  options: any = {}
) => {
  const authHeaders = {
    Authorization: getAuthToken(),
    "Content-Type": "application/json",
  };

  options.headers = {
    ...authHeaders,
    ...options.headers,
  };

  return fetch(url, { ...options, method }).then((response) => {
    if (response.status === 401) {
      router.push("/login");
    }
    return response;
  });
};

export default fetchWithAuthorization;
