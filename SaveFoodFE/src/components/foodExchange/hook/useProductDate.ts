import dayjs from "dayjs";
import { useState } from "react";
import {
  CreateProductType,
  DateNames,
  ExchangeDatesType,
  Product,
} from "../../../type/mzwz";
import { formatLocalDateTime } from "../../../utils/date/date";

interface useProductProps {
  product?: Product;
  handleProductUpdate: (update: Partial<CreateProductType>) => void;
}

export const useProductDate = ({
  product,
  handleProductUpdate,
}: useProductProps) => {
  const initialDate = dayjs();

  const [dates, setDates] = useState<ExchangeDatesType>({
    startExchangeTime: (product
      ? dayjs(product.startExchangeTime)
      : initialDate) as unknown as Date,
    endExchangeTime: (product
      ? dayjs(product.endExchangeTime)
      : initialDate) as unknown as Date,
    expirationDate: (product
      ? dayjs(product.expirationDate)
      : initialDate) as unknown as Date,
    productionDate: (product
      ? dayjs(product.productionDate)
      : initialDate) as unknown as Date,
  });
  const handleDateChange = (dateToChange: DateNames, newDate: Date | null) => {
    setDates((prev) => ({ ...prev, [dateToChange]: newDate }));
  };

  const handleUpdate = (dateToChange: DateNames, newDate: Date | null) => {
    handleDateChange(dateToChange, newDate);
    if (newDate) {
      handleProductUpdate({
        [dateToChange]: formatLocalDateTime(newDate.toString()),
      });
    }
  };

  const handleResetDate = () => {
    setDates({
      startExchangeTime: dayjs(product?.startExchangeTime) as unknown as Date,
      endExchangeTime: dayjs(product?.endExchangeTime) as unknown as Date,
      expirationDate: dayjs(product?.expirationDate) as unknown as Date,
      productionDate: dayjs(product?.productionDate) as unknown as Date,
    });
  };

  return {
    dates: dates,
    handleUpdate,
    handleResetDate,
    todayDate: initialDate as unknown as Date,
  };
};
