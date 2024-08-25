import { UNIT_KG, UNIT_KILOGRAMS, UNIT_L } from "../../constants/productUnits";

export function getProductUnit(productUnit: string) {
  return productUnit === UNIT_KILOGRAMS ? UNIT_KG : UNIT_L;
}

export default getProductUnit;
