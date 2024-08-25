import Button from "@mui/material/Button";
import { useTranslation } from "next-i18next";
import { useEffect, useState } from "react";
import { foodExchangeDictionary } from "../../../constants/dictionary";
import { HTTP_POST } from "../../../constants/httpMethods";
import { foodExchangeUrl } from "../../../constants/url/foodExchange";
import { LatLng } from "../../../type/mzls";
import { Product } from "../../../type/mzwz";
import fetchWithAuthorization from "../../../utils/axios/fetchWrapper";
import snackbarTranslated from "../../../utils/snackbar/snackbarTranslated";

const textFieldVariant = "standard";
const translation = "Tabs.AllProducts.ReservationStepper.SelfPickupStep.";

interface ProductProps {
  product: Product;
  setExchangeId: (value: string) => void;
}

export function SelfPickup({ product, setExchangeId }: ProductProps) {
  const [hydrated, setHydrated] = useState(false);
  const { t } = useTranslation(foodExchangeDictionary);
  const [userLocation, setUserLocation] = useState<LatLng>();

  useEffect(() => {
    setHydrated(true);
  }, []);

  if (!hydrated) {
    return null;
  }

  const selfPickupReservation = async (event: React.FormEvent) => {
    event.preventDefault();

    const data = {
      productId: product.id,
      reserved: "true",
    };

    const requestOptions = {
      body: JSON.stringify(data),
    };

    await fetchWithAuthorization(
      `${foodExchangeUrl}exchanges`,
      HTTP_POST,
      requestOptions
    )
      .then((res: Response) => {
        res
          .json()
          .then((resAxios) => {
            if (res.ok) {
              res
                .json()
                .then((resAxios) => setExchangeId(resAxios.exchange.id));
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
            snackbarTranslated(t("Product.Hide.error"), "error");
            return;
          });
      })
      .catch((error) => {
        snackbarTranslated(t("noItemsSec.end"), "error");
      });
  };

  return (
    <Button variant="contained" onClick={(e) => selfPickupReservation(e)}>
      {t(translation + "reservation")}
    </Button>
  );
}
export default SelfPickup;
