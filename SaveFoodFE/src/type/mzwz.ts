export const ProductState = {
  VISIBLE: "VISIBLE",
  HIDDEN: "HIDDEN",
  RESERVED: "RESERVED",
  EXCHANGED: "EXCHANGED",
} as const;

export type ProductStateType = keyof typeof ProductState;

export const ProductionType = {
  HOMEMADE: "HOMEMADE",
  PURCHASED: "PURCHASED",
} as const;

export const productCategories = {
  VEGETABLES: "VEGETABLES",
  FRUITS: "FRUITS",
  MEAT: "MEAT",
  FISH: "FISH",
  DAIRY: "DAIRY",
  BREAD: "BREAD",
  SWEETS: "SWEETS",
  OTHER: "OTHER",
} as const;
export type DateNames =
  | "startExchangeTime"
  | "endExchangeTime"
  | "expirationDate"
  | "productionDate";
export type ExchangeDatesType = { [key in DateNames]: Date };

export type ProductCategory = keyof typeof productCategories;

export const productCategoriesKeys = Object.keys(
  productCategories
) as ProductCategory[];

export type ProductProduction = keyof typeof ProductionType;

export const productProductionType = Object.keys(
  ProductionType
) as ProductProduction[];

export const ExchangeState = {
  WAITING_FOR_RESERVED_DELIVERY: "WAITING_FOR_RESERVED_DELIVERY",
  COMPLETED: "COMPLETED",
  WAITING_FOR_RECEIPT_PRODUCT: "WAITING_FOR_RECEIPT_PRODUCT",
  AWAITING: "AWAITING",
  WAITING_FOR_PENDING_DELIVERIES: "WAITING_FOR_PENDING_DELIVERIES",
} as const;

export type ExchangeStateType = keyof typeof ExchangeState;

export const DeliveryToUserState = {
  WAITING_FOR_VOLUNTEER: "WAITING_FOR_VOLUNTEER",
  RESERVED: "RESERVED",
  COMPLETED: "COMPLETED",
} as const;

export type DeliveryToUserStateType = keyof typeof DeliveryToUserState;

export type ProductionTypeType = keyof typeof ProductionType;

export interface Product {
  id: number;
  accountId: number;
  accountUserName: string;
  accountAvgRating: number;
  name: string;
  description: string;
  categories: ProductCategory;
  expirationDate: string;
  productionDate: string;
  homemade: boolean;
  mapAddress: MapAddress | CreateMapAddressType;
  startExchangeTime: string;
  endExchangeTime: string;
  actionCancelled: boolean;
  productState: ProductStateType;
  exchangeId: string;
  etag: string;
}

export type CreateProductType = Pick<
  Product,
  | "name"
  | "description"
  | "categories"
  | "expirationDate"
  | "mapAddress"
  | "startExchangeTime"
  | "endExchangeTime"
  | "homemade"
  | "productionDate"
>;

export type CreateMapAddressType = Pick<
  MapAddress,
  | "latitude"
  | "longitude"
  | "name"
  | "city"
  | "street"
  | "streetNumber"
  | "postalCode"
>;

export interface MapAddress {
  id: number;
  latitude: number;
  longitude: number;
  name: string;
  city: string;
  street: string;
  streetNumber: string;
  postalCode: string;
  etag: string;
}

export interface DeliveryToUser {
  id: number;
  actionCancelled: boolean;
  accountId: number;
  accountAvgRating: number;
  accountUsername: string;
  deliveryState: DeliveryToUserStateType;
  exchange: Exchange;
  mapAddress: MapAddress;
  etag: string;
}

export interface Exchange {
  id: number;
  actionCancelled: boolean;
  accountId: number;
  accountAvgRating: number;
  accountUsername: string;
  exchangeState: ExchangeStateType;
  product: Product;
  deliveryId: number;
  deliveryToUser: DeliveryToUser;
  etag: string;
}

export interface FavouriteCategories {
  id: number;
  categories: ProductCategory[];
  etag: string;
}
export const ownReceipt = "OwnReceipt";
export const volunteerDelivery = "VolunteerDelivery";
export type ReservationType = typeof ownReceipt | typeof volunteerDelivery;
