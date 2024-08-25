import Button from "@mui/material/Button";
import { useTranslation } from "next-i18next";
import { useEffect, useState } from "react";
import { HTTP_POST } from "../../../constants/httpMethods";
import { foodExchangeUrl } from "../../../constants/url/foodExchange";
import { LatLng } from "../../../type/mzls";
import { MapAddress, Product } from "../../../type/mzwz";
import fetchWithAuthorization from "../../../utils/axios/fetchWrapper";
import snackbarTranslated from "../../../utils/snackbar/snackbarTranslated";

interface ExchangeProps {
  exchangeId: string;
  deliveryMapAddress: MapAddress;
}

export function VolunteerDelivery({
  exchangeId,
  deliveryMapAddress,
}: ExchangeProps) {
  const [productPatch, setProductPatch] = useState<Product>();
  const [tabValue, setTabValue] = useState(0);
  const [hydrated, setHydrated] = useState(false);
  const { t } = useTranslation("foodExchange");
  const [userLocation, setUserLocation] = useState<LatLng>();
  const [selectedFilter, setSelectedFilter] = useState("");

  const textFieldVariant = "standard";
  const translation = "Tabs.AllProducts.ReservationStepper.VoluneerPickupStep.";

  useEffect(() => {
    setHydrated(true);
  }, []);

  if (!hydrated) {
    return null;
  }

  const volunteerReservation = async (event: React.FormEvent) => {
    event.preventDefault();

    const data = {
      exchangeId: exchangeId,
      deliveryMapAddress: deliveryMapAddress,
    };

    const requestOptions = {
      body: JSON.stringify(data),
    };

    await fetchWithAuthorization(
      `${foodExchangeUrl}deliveryToUser`,
      HTTP_POST,
      requestOptions
    )
      .then((res: Response) => {
        res
          .json()
          .then((resAxios) => {
            if (resAxios.ok) {
              snackbarTranslated(t("Product.Hide.success"), "success");
              return;
            }
            if (resAxios.key !== undefined) {
              snackbarTranslated(resAxios.key, "error");
              return;
            }
            throw new Error();
          })
          .catch((error) => {
            snackbarTranslated(t("noItems1.end"), "error");
          });
      })
      .catch((error) => {
        snackbarTranslated(t("noItemsSec.end"), "error");
      });
  };

  return (
    <Button variant="contained" onClick={(e) => volunteerReservation(e)}>
      {t(translation + "button")}
    </Button>
  );
}
export default VolunteerDelivery;
