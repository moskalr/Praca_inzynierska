export const validation = (t: Function) => ({
  fridge: {
    title: {
      required: t("validation.required"),
      minLength: {
        value: 3,
        message: t("validation.fridge.title_min"),
      },
      maxLength: {
        value: 40,
        message: t("validation.fridge.title_max"),
      },
    },
    description: {
      required: t("validation.required"),
      minLength: {
        value: 3,
        message: t("validation.fridge.description_min"),
      },
      maxLength: {
        value: 255,
        message: t("validation.fridge.description_max"),
      },
    },
  },
  account: {
    username: {
      required: t("validation.required"),
      minLength: {
        value: 6,
        message: t("validation.fridge.username_min"),
      },
      maxLength: {
        value: 16,
        message: t("validation.fridge.username_max"),
      },
    },
    role: {
      required: t("validation.required"),
    },
  },
  product: {
    name: {
      required: t("validation.required"),
      minLength: {
        value: 3,
        message: t("validation.product.name_min"),
      },
      maxLength: {
        value: 40,
        message: t("validation.product.name_max"),
      },
    },
    description: {
      maxLength: {
        value: 255,
        message: t("validation.product.description"),
      },
    },
    quantity: {
      required: t("validation.required"),
      min: {
        value: 1,
        message: t("validation.product.quantity_min"),
      },
      max: {
        value: 100000,
        message: t("validation.product.quantity_max"),
      },
    },
    unitOfMeasure: {
      required: t("validation.required"),
      pattern: {
        value: /^(GRAMS|MILLILITERS)$/,
        message: t("validation.product.unit_of_measure"),
      },
    },
    amount: {
      required: t("validation.required"),
      min: {
        value: 1,
        message: t("validation.product.amount_min"),
      },
      max: {
        value: 100,
        message: t("validation.product.amount_max"),
      },
    },
    productCategory: {
      required: t("validation.required"),
    },
    expirationDate: {
      required: t("validation.required"),
      validate: {
        dateNotInPast: (value: Date) => {
          const selectedDate = new Date(value);
          const currentDate = new Date();
          return selectedDate >= currentDate;
        },
      },
    },
    daysToEat: {
      required: t("validation.required"),
      min: {
        value: 1,
        message: t("validation.product.days_to_eat_min"),
      },
      max: {
        value: 360,
        message: t("validation.product.days_to_eat_max"),
      },
    },
  },
});
