import { useEffect, useState } from "react";
import { HTTP_GET } from "../../constants/httpMethods";
import fetchWithAuthorization from "../axios/fetchWrapper";
import snackbar from "../snackbar/snackbar";

const useProductData = (
  id: number,
  paginationParams: ProductPagginationParams,
  t: (message: string) => string
) => {
  const [products, setProducts] = useState<ProductData[]>([]);
  const [numberOfProducts, setNumberOfProducts] = useState(0);

  const fetchProductList = async () => {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append("page", String(paginationParams.page));
      queryParams.append("size", String(paginationParams.size));
      queryParams.append(
        "productSortingType",
        String(paginationParams.productSortingType)
      );
      queryParams.append(
        "productCategory",
        String(paginationParams.productCategory)
      );
      queryParams.append("name", String(paginationParams.name));

      const response = await fetchWithAuthorization(
        `/api/private-fridge/products/fridges/${id}?${queryParams.toString()}`,
        HTTP_GET
      );

      if (response.ok) {
        const data = await response.json();
        setProducts(data.products.content);
        setNumberOfProducts(data.products.totalElements);
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

  return { products, numberOfProducts };
};

export default useProductData;
