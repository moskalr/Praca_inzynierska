export const AddProductFormValidation = (t: Function) => ({
  title: {
    required: {
      value: true,
      message: t("fridge.messages.requiredField"),
    },
    minLength: {
      value: 3,
      message: t("fridge.messages.minLength", {
        action: 3,
      }),
    },
    maxLength: {
      value: 100,
      message: t("fridge.messages.maxLengtsh", {
        action: 100,
      }),
    },
  },
  description: {
    required: {
      value: true,
      message: t("fridge.messages.requiredField"),
    },
    minLength: {
      value: 10,
      message: t("fridge.messages.minLength", {
        action: 10,
      }),
    },
    maxLength: {
      value: 2000,
      message: t("fridge.messages.maxLength", {
        action: 2000,
      }),
    },
  },
  size: {
    required: {
      value: true,
      message: t("fridge.messages.requiredField"),
    },
    pattern: {
      value:
        /^(0(\.(\d{0,4}[1-9]|[1-4]\d{0,3}|50(\.0{1,4})?))|[1-9]\d{0,4}(\.\d{0,4}[1-9])?)$/,
      message: t("fridge.messages.validNumber"),
    },
  },
  categories: {
    required: {
      value: true,
      message: t("fridge.messages.requiredField"),
    },
  },
  pieces: {
    required: {
      value: true,
      message: t("fridge.messages.requiredField"),
    },
    pattern: {
      value: /^\d+$/,
      message: t("fridge.messages.validPieces"),
    },
  },
  requiredField: {
    required: {
      value: true,
      message: t("fridge.messages.requiredField"),
    },
  },

  date: {
    required: {
      value: true,
      message: t("fridge.messages.requiredField"),
    },
    validate: {
      dateNotInPast: (value: Date) => {
        const selectedDate = new Date(value);
        const currentDate = new Date();
        return (
          selectedDate.getDay >= currentDate.getDate &&
          selectedDate.getMonth >= currentDate.getMonth &&
          selectedDate.getFullYear >= currentDate.getFullYear
        );
      },
    },
  },
  image: {
    required: {
      value: true,
      message: t("fridge.messages.requiredField"),
    },
  },
  manager: {
    required: {
      value: true,
      message: t("managedSocialFridge.messages.requiredField"),
    },
  },
  street: {
    required: {
      value: true,
      message: t("managedSocialFridge.messages.requiredField"),
    },
    maxLength: {
      value: 64,
      message: t("managedSocialFridge.messages.streetNameTooLong"),
    },
  },
  buildingNumber: {
    required: {
      value: true,
      message: t("managedSocialFridge.messages.requiredField"),
    },
    pattern: {
      value: /^\d+(\/\d+)?[A-Za-z]?$/,
      message: t("managedSocialFridge.messages.invalidBuildingNumber"),
    },
  },
  city: {
    required: {
      value: true,
      message: t("managedSocialFridge.messages.requiredField"),
    },
    maxLength: {
      value: 64,
      message: t("managedSocialFridge.messages.cityNameTooLong"),
    },
  },
  postalCode: {
    required: {
      value: true,
      message: t("managedSocialFridge.messages.requiredField"),
    },
    pattern: {
      value: /^\d{2}-\d{3}$/,
      message: t("managedSocialFridge.messages.invalidPostalCode"),
    },
  },
});
