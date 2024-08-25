import { SocialFridge, Suggestion } from "../../type/mzls";

export const sortByStreet = (
  items: (Suggestion | SocialFridge)[],
  ascendingOrder: boolean
): (Suggestion | SocialFridge)[] => {
  return items?.sort((a, b) => {
    const streetA = getAddress(a).toLowerCase();
    const streetB = getAddress(b).toLowerCase();
    return ascendingOrder
      ? streetA.localeCompare(streetB)
      : streetB.localeCompare(streetA);
  });
};

const getAddress = (item: Suggestion | SocialFridge) => {
  if ("socialFridge" in item) {
    return item.socialFridge.address.street;
  } else {
    return item.address.street;
  }
};

export default sortByStreet;
