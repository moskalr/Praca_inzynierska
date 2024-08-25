import { useTranslation } from "react-i18next";
import {
  foodExchangeDictionary,
  mapDictionary,
  eaaDictionary,
  accountsDictionary,
  socialFridgeDictionary,
  privateFridgeDictionary,
} from "../../constants/dictionary";

type DictionaryType =
  | typeof foodExchangeDictionary
  | typeof privateFridgeDictionary
  | typeof socialFridgeDictionary
  | typeof accountsDictionary
  | typeof mapDictionary
  | typeof eaaDictionary;

export function useAppTranslation(type: DictionaryType) {
  const { t } = useTranslation(type);
  return t;
}
