import { CategoryUnitTypes, UnitTypes } from "../../type/mzwo";

type UnitKeys = keyof UnitTypes;

export function eaaCalculateCategoryPercentages(
  a: CategoryUnitTypes,
  b: CategoryUnitTypes
): CategoryUnitTypes {
  const result: CategoryUnitTypes = {
    Proteins: divideCategory(a.Proteins, b.Proteins),
    Prepared: divideCategory(a.Prepared, b.Prepared),
    Grain: divideCategory(a.Grain, b.Grain),
    Vegetables: divideCategory(a.Vegetables, b.Vegetables),
    Dairy: divideCategory(a.Dairy, b.Dairy),
    Beverages: divideCategory(a.Beverages, b.Beverages),
    Sweets: divideCategory(a.Sweets, b.Sweets),
    Fruits: divideCategory(a.Fruits, b.Fruits),
  };

  return result;
}

function divideCategory(a: UnitTypes, b: UnitTypes): UnitTypes {
  const result: UnitTypes = {
    Item: 0,
    Liter: 0,
    Piece: 0,
    Kilogram: 0,
    Pack: 0,
  };

  const unitKeys: UnitKeys[] = ["Item", "Liter", "Piece", "Kilogram", "Pack"];

  for (const unitKey of unitKeys) {
    if (b[unitKey] !== 0) {
      result[unitKey] = a[unitKey] / b[unitKey] || 0;
    } else {
      result[unitKey] = 0;
    }
  }

  return result;
}
