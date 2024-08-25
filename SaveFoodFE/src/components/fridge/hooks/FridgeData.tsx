import { useContext, useEffect, useState } from "react";
import { UserContext } from "../../../components/context/UserContextProvider";
import { HTTP_OK, HTTP_UNAUTHORIZED } from "../../../constants/httpCodes";
import { HTTP_GET, HTTP_PATCH } from "../../../constants/httpMethods";
import {
  CLIENT_GUEST,
  CLIENT_MANAGER,
  CLIENT_USER,
} from "../../../constants/roles";
import {
  Account,
  Address,
  ProductList,
  SocialFridge,
} from "../../../type/mzls";
import fetchWithAuthorization from "../../../utils/axios/fetchWrapper";
import snackbar from "../../../utils/snackbar/snackbar";

const FridgeData = (fridgeId?: number, t?: Function, router?: any) => {
  const [socialFridge, setSocialFridge] = useState<SocialFridge>();
  const [rating, setRating] = useState(0.0);
  const [newRating, setNewRating] = useState(0.0);
  const [loadingState, setLoadingState] = useState(true);
  const [socialFridgeETag, setSocialFridgeETag] = useState();
  const [gradeETag, setGradeETag] = useState();
  const { currentRole } = useContext(UserContext);

  const setManager = (newManager: Account) => {
    setSocialFridge((prevSocialFridge) => ({
      ...prevSocialFridge!,
      account: {
        ...prevSocialFridge!.account,
        ...newManager,
      },
    }));
  };

  const setAddress = (newAddress: Address) => {
    setSocialFridge((prevSocialFridge) => ({
      ...prevSocialFridge!,
      address: {
        ...prevSocialFridge!.address,
        ...newAddress,
      },
    }));
  };

  const setProductState = (newState: string, id: number) => {
    socialFridge?.products.map((product) => {
      if (product.id === id) {
        product.state = newState;
      }
    });
  };

  const addProduct = (product: ProductList) => {
    socialFridge?.products.push(product);
  };

  const handleRatingChange = async () => {
    if (t) {
      const requestOptions = {
        body: JSON.stringify({
          value: newRating,
          path: "/rating",
        }),
        headers: {
          "If-Match": gradeETag,
        },
      };

      await fetchWithAuthorization(
        `/api/social-fridge/fridge/${fridgeId}`,
        HTTP_PATCH,
        requestOptions
      )
        .then((response) => {
          return response.json().then((data) => {
            if (response.ok) {
              setRating(newRating);
              snackbar("fridge.successes.rating_success", "success", t);
            } else if (response.status === HTTP_UNAUTHORIZED) {
              snackbar("errors.unauthorized", "error", t);
              router.push("/login");
            } else if (data.error.key !== undefined) {
              snackbar(`errors.${data.error.key}`, "error", t);
            }
          });
        })
        .catch(() => {
          snackbar("errors.rating_error", "error", t);
        });
    }
  };

  const fetchDataManager = async () => {
    if (t) {
      try {
        const fridgeResponse = await fetch(
          `/api/social-fridge/fridge/${fridgeId}`,
          {
            method: HTTP_GET,
          }
        );
        if (fridgeResponse.status === HTTP_OK) {
          const fridgeData = await fridgeResponse.json();
          setSocialFridge(fridgeData.fridge);
          setSocialFridgeETag(fridgeData.eTag);
        } else {
          snackbar("errors.error", "error", t);
          setLoadingState(false);
          router.push("/");
        }
      } catch (error) {
        snackbar("errors.error", "error", t);
      }
      setLoadingState(false);
    }
  };

  const fetchDataUser = async () => {
    if (t) {
      try {
        const [fridgeResponse, ratingResponse] = await Promise.all([
          fetchWithAuthorization(
            `/api/social-fridge/fridge/${fridgeId}`,
            HTTP_GET
          ),
          fetchWithAuthorization(
            `/api/social-fridge/social-fridge-rating/${fridgeId}`,
            HTTP_GET
          ),
        ]);

        if (fridgeResponse.status === HTTP_OK) {
          const fridgeData = await fridgeResponse.json();
          setSocialFridge(fridgeData.fridge);
          setSocialFridgeETag(fridgeData.eTag);
        } else {
          snackbar("errors.error", "error", t);
          setLoadingState(false);
          router.push("/");
        }

        if (ratingResponse.status === HTTP_OK) {
          const ratingData = await ratingResponse.json();
          setRating(ratingData.rating);
          setNewRating(ratingData.rating);
          setGradeETag(ratingData.eTag);
        } else if (fridgeResponse.status === HTTP_UNAUTHORIZED) {
          snackbar("errors.unauthorized", "error", t);
          router.push("/login");
        } else {
          snackbar("errors.error", "error", t);
        }
      } catch (error) {
        snackbar("errors.error", "error", t);
      }
      setLoadingState(false);
    }
  };

  const fetchData = async () => {
    if (currentRole === CLIENT_MANAGER || currentRole === CLIENT_GUEST) {
      fetchDataManager();
    } else if (currentRole === CLIENT_USER) {
      fetchDataUser();
    }
  };

  useEffect(() => {
    fetchData();
  }, [fridgeId]);

  return {
    socialFridge,
    rating,
    newRating,
    loadingState,
    setNewRating,
    setSocialFridge,
    setRating,
    setLoadingState,
    handleRatingChange,
    setManager,
    setAddress,
    setProductState,
    socialFridgeETag,
    fetchData,
    addProduct,
  };
};

export default FridgeData;
