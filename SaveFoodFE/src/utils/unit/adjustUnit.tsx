import { UNIT_KILOGRAMS, UNIT_LITERS } from "../../constants/productUnits";

type Unit = string;
type Quantity = number;

export function adjustUnit(unit: Unit, quantity: Quantity) {
  let adjustedQuantity = quantity;
  let adjustedUnit = unit.toLowerCase();

  switch (adjustedUnit) {
    case "ml":
      adjustedQuantity = quantity / 1000;
      adjustedUnit = "l";
      break;
    case "cl":
      adjustedQuantity = quantity / 100;
      adjustedUnit = "l";
      break;
    case "g":
      adjustedQuantity = quantity / 1000;
      adjustedUnit = "kg";
      break;
    case "l":
    case "liter":
      adjustedUnit = UNIT_LITERS;
      break;
    case "kg":
    case "kilogram":
      adjustedUnit = UNIT_KILOGRAMS;
      break;
  }

  return { adjustedQuantity, adjustedUnit };
}
