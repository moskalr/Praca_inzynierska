import { useEffect, useState } from "react";
import { HTTP_GET } from "../../constants/httpMethods";
import fetchWithAuthorization from "../axios/fetchWrapper";
import snackbar from "../snackbar/snackbar";

const useAccountsData = (
  id: number,
  paginationParams: AccountsPagginationParams,
  t: (message: string) => string
) => {
  const [accounts, setAccounts] = useState<PrivateFridgeAccountListData[]>([]);
  const [numberOfAccounts, setNumberOfAccounts] = useState(0);

  const fetchProductList = async () => {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append("page", String(paginationParams.page));
      queryParams.append("size", String(paginationParams.size));
      if (paginationParams.role !== "") {
        queryParams.append("role", String(paginationParams.role));
      }
      const response = await fetchWithAuthorization(
        `/api/private-fridge/fridges-accounts/accounts/${id}?${queryParams.toString()}`,
        HTTP_GET
      );

      if (response.ok) {
        const data = await response.json();
        setAccounts(data.accounts.content);
        setNumberOfAccounts(data.accounts.totalElements);
      } else {
        snackbar("error_message.error", "error", t);
      }
    } catch (error) {
      snackbar("error_message.error", "error", t);
    }
  };

  useEffect(() => {
    fetchProductList();
  }, [paginationParams]);

  return { accounts, numberOfAccounts };
};

export default useAccountsData;
