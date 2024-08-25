import { useEffect, useState } from "react";
import { HTTP_GET } from "../../constants/httpMethods";
import fetchWithAuthorization from "../axios/fetchWrapper";
import snackbar from "../snackbar/snackbar";

export const usePrivateFridgeInvitationData = (
  paginationParams: PrivateFridgesInvitationsPagginationParams,
  t: (message: string) => string
) => {
  const [invitations, setInvitations] = useState<PrivateFridgeInvitationData[]>(
    []
  );
  const [numberOfInvitations, setNumberOfInvitations] = useState(0);

  useEffect(() => {
    const fetchPrivateFridgeList = async () => {
      try {
        const queryParams = new URLSearchParams();
        queryParams.append("page", String(paginationParams.page));
        queryParams.append("size", String(paginationParams.size));
        if (paginationParams.privateFridgeId != null) {
          queryParams.append(
            "privateFridgeId",
            String(paginationParams.privateFridgeId)
          );
          if (paginationParams.status != null) {
            queryParams.append("status", String(paginationParams.status));
          }
        }

        const response = await fetchWithAuthorization(
          `/api/private-fridge/invitations/invitation?${queryParams.toString()}`,
          HTTP_GET
        );

        if (response.ok) {
          const data = await response.json();
          setInvitations(data.invitations.content);
          setNumberOfInvitations(data.invitations.totalElements);
        } else {
          snackbar("error_message.error", "error", t);
        }
      } catch (error) {
        snackbar("error_message.error", "error", t);
      }
    };

    fetchPrivateFridgeList();
  }, [paginationParams]);

  const handleUpdateInvitationState = (invitationId: number) => {
    setNumberOfInvitations((prevValue) => prevValue - 1);
    setInvitations((prevValue) => {
      const updatedInvitations = [...prevValue];
      if (invitationId >= 0 && invitationId < updatedInvitations.length) {
        updatedInvitations.splice(invitationId, 1);
      }
      return updatedInvitations;
    });
  };

  return { invitations, numberOfInvitations, handleUpdateInvitationState };
};

export default usePrivateFridgeInvitationData;
