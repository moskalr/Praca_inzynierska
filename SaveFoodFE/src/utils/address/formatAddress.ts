import { CreateAddressMZWO } from "../../type/mzwo";
import { CreateMapAddressType } from "../../type/mzwz";

export function createFormattedAddress(
  address: CreateAddressMZWO | CreateMapAddressType
) {
  return `${address.street} ${address.streetNumber}, ${address.postalCode} ${address.city}`;
}
