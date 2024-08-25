interface PrivateFridgeData {
  id: number;
  title: string;
  description: string;
  archived: boolean;
}

interface PrivateFridgeAccountData {
  privateFridge: PrivateFridgeData;
  role: string;
  enabled: boolean;
}

interface PrivateFridgeAccountListData {
  id: number;
  account: AccountData;
  role: string;
  enabled: boolean;
}

interface AccountData {
  id: number;
  username: string;
  isEnabled: boolean;
}

interface PrivateFridgeInvitationData {
  id: number;
  createdBy: string;
  creationDateTime: string;
  receiver: AccountData;
  privateFridge: PrivateFridgeData;
  status: string;
  role: string;
}

interface PrivateFridgesPagginationParams {
  size: number;
  page: number;
  isArchived: null | boolean;
}

interface PrivateFridgesInvitationsPagginationParams {
  size: number;
  page: number;
  privateFridgeId: number | null;
  status: string | null;
}

interface PrivateFridgeInfoData {
  id: number;
  title: string;
  description: string;
  archived: boolean;
}

interface ProductPagginationParams {
  size: number;
  page: number;
  productSortingType: string | null;
  productCategory: string | null;
  name: string | null;
}

interface ProductData {
  id: number;
  name: string;
  description: string;
  quantity: number;
  unitOfMeasure: string;
  productCategory: string;
  expirationDate: string;
  daysToEat: number;
  opened: boolean;
  image: string;
}

interface PoductFormValues {
  name: string;
  description: string;
  quantity: number;
  unitOfMeasure: string;
  amount: number;
  expirationDate: Date;
  productCategory: string;
  daysToEat: number;
  image: File | any;
}

interface AccountsPagginationParams {
  size: number;
  page: number;
  role: string | null;
}
