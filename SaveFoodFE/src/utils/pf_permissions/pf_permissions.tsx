import {
  COOK,
  OWNER,
  SUPPLIER,
  USER,
} from "../../constants/privateFridgeRoles";

export type UserRole =
  | typeof OWNER
  | typeof USER
  | typeof SUPPLIER
  | typeof COOK;

type Permissions = {
  [key: string]: UserRole[];
};

export const permissions: Permissions = {
  canAddProduct: [OWNER, USER, SUPPLIER],
  canTakeOutProduct: [OWNER, USER, COOK],
  canCancelInvitation: [OWNER],
  canEditUser: [OWNER],
  canEditFridge: [OWNER],
  canQuitFridge: [USER, SUPPLIER, COOK],
  canGetRecipes: [OWNER, USER, COOK],
  canSendInvitation: [OWNER],
  canGetSentInvitations: [OWNER],
};
