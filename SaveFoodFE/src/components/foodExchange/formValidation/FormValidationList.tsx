import { TFunction } from "next-i18next";

const translation = "ValidationMessages.";

export const FormValidationList = (t: TFunction) => ({
  title: {
    required: {
      value: true,
      message: t(translation + "Title.required"),
    },
    minLength: {
      value: 3,
      message: t(translation + "Title.minlength", {
        action: 3,
      }),
    },
    maxLength: {
      value: 50,
      message: t(translation + "Title.maxlength", {
        action: 50,
      }),
    },
  },
  description: {
    required: {
      value: true,
      message: t(translation + "Description.required"),
    },
    minLength: {
      value: 10,
      message: t(translation + "Description.minlength", {
        action: 10,
      }),
    },
    maxLength: {
      value: 300,
      message: t(translation + "Description.maxlength", {
        action: 300,
      }),
    },
  },
  category: {
    required: {
      value: true,
      message: t(translation + "Category.required"),
    },
  },
  street: {
    required: {
      value: true,
      message: t(translation + "MapAddress.Street.required"),
    },
    maxLength: {
      value: 64,
      message: t(translation + "MapAddress.Street.maxlength"),
    },
  },
  streetNumber: {
    required: {
      value: true,
      message: t(translation + "MapAddress.StreetNumber.required"),
    },
    pattern: {
      value: /^\d+(\/\d+)?[A-Za-z]?$/,
      message: t(translation + "MapAddress.StreetNumber.pattern"),
    },
  },
  city: {
    required: {
      value: true,
      message: t(translation + "MapAddress.City.required"),
    },
    maxLength: {
      value: 64,
      message: t(translation + "MapAddress.City.maxlength"),
    },
  },
  postalCode: {
    required: {
      value: true,
      message: t(translation + "MapAddress.City.required"),
    },
    pattern: {
      value: /^\d{2}-\d{3}$/,
      message: t(translation + "MapAddress.City.pattern"),
    },
  },
});
