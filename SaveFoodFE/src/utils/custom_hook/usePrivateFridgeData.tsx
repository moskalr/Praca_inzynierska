import { useEffect, useState } from "react";
import { HTTP_GET } from "../../constants/httpMethods";
import fetchWithAuthorization from "../axios/fetchWrapper";
import snackbar from "../snackbar/snackbar";

const usePrivateFridgeData = (
  paginationParams: PrivateFridgesPagginationParams,
  t: (message: string) => string
) => {
  const [fridges, setFridges] = useState<PrivateFridgeAccountData[]>([]);
  const [numberOfPrivateFridges, setNumberOfPrivateFridges] = useState(0);

  const fetchPrivateFridgeList = async () => {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append("page", String(paginationParams.page));
      queryParams.append("size", String(paginationParams.size));
      if (paginationParams.isArchived != null) {
        queryParams.append("isArchived", String(paginationParams.isArchived));
      }

      const response = await fetchWithAuthorization(
        `/api/private-fridge/fridges-accounts/fridge-account?${queryParams.toString()}`,
        HTTP_GET
      );

      if (response.ok) {
        const data = await response.json();
        setFridges(data.fridges.content);
        setNumberOfPrivateFridges(data.fridges.totalElements);
      } else {
        snackbar("error_message.error", "error", t);
      }
    } catch (error) {
      snackbar("error_message.error", "error", t);
    }
  };

  useEffect(() => {
    fetchPrivateFridgeList();
  }, [paginationParams]);

  const handleUpdateFridgeList = () => {
    fetchPrivateFridgeList();
  };

  return { fridges, numberOfPrivateFridges, handleUpdateFridgeList };
};

export default usePrivateFridgeData;
