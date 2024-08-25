import { Categories } from "../utils/categories/categories";

export interface SocialFridge {
  id: number;
  products: ProductList[];
  state: string;
  socialFridgeAverageRating: SocialFridgeAverageRatingInfo;
  address: Address;
  account: Account;
  roles: [string];
  savedFood: number;
  donatedFood: number;
}

export interface Product {
  id: number;
  expirationDate: [number, number, number, number, number];
  title: string;
  description: string;
  image: string;
  productUnit: string;
  size: number;
  state: string;
  socialFridge: SocialFridge;
  categories: [string];
}

export interface ProductList {
  id: number;
  title: string;
  image: string;
  state: string;
  categories: [string];
}

export interface Address {
  id: number;
  street: string;
  buildingNumber: string;
  city: string;
  postalCode: string;
  latitude: string;
  longitude: string;
}

export interface SocialFridgeAverageRatingInfo {
  averageRating: number;
}

export interface Account {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  isEnabled: boolean;
  email: string;
  language: string;
  roles: [string];
}

export interface LatLng {
  lat: number;
  lng: number;
}

export interface Suggestion {
  id: number;
  socialFridge: SocialFridge;
  description: string;
  isNew: boolean;
  image: string;
  etag: string;
}

export interface Preferences {
  favSocialFridges: [SocialFridge];
  favCategories: [Categories];
}

export interface Statistic {
  id: number;
  addressInfo: Address;
  state: string;
  socialFridgeAverageRating: SocialFridgeAverageRatingInfo;
  donatedFoodCount: number;
  archivedByUserCount: number;
  archivedBySystemCount: number;
  donatedFoodWeigh: number;
  savedFoodWeigh: number;
  wasteFoodWeigh: number;
  categoryCounts: Map<Categories, number>;
}
