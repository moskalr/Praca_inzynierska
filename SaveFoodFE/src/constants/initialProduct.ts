import exp from "constants";
import {
  CreateMapAddressType,
  CreateProductType,
  ProductCategory,
} from "../type/mzwz";

export const initialAddress: CreateMapAddressType = {
  latitude: 0,
  longitude: 0,
  name: "",
  city: "",
  street: "",
  streetNumber: "",
  postalCode: "",
};

export const initialProductMZWZ: CreateProductType = {
  name: "",
  description: "",
  categories: [] as unknown as ProductCategory,
  expirationDate: "",
  mapAddress: initialAddress,
  startExchangeTime: "",
  endExchangeTime: "",
  homemade: false,
  productionDate: "",
};
