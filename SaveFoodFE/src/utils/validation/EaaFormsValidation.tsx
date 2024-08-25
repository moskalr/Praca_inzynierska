export const EaaFormsValidation = (t: Function) => ({
  eventTitle: {
    required: {
      value: true,
      message: t("validation.required"),
    },
    minLength: {
      value: 3,
      message: t("validation.minLength", {
        action: 3,
      }),
    },
    maxLength: {
      value: 100,
      message: t("validation.maxLengtsh", {
        action: 100,
      }),
    },
  },
  eventContent: {
    required: {
      value: true,
      message: t("validation.required"),
    },
    minLength: {
      value: 10,
      message: t("validation.minLength", {
        action: 10,
      }),
    },
    maxLength: {
      value: 2000,
      message: t("validation.maxLength", {
        action: 2000,
      }),
    },
  },
  maxParticipants: {
    required: {
      value: true,
      message: t("validation.required"),
    },
  },
  foodQuantity: {
    required: {
      value: true,
      message: t("validation.required"),
    },
  },
  foodUnit: {
    required: {
      value: true,
      message: t("validation.required"),
    },
  },
  maxReservationQuantity: {
    required: {
      value: true,
      message: t("validation.required"),
    },
  },
  street: {
    required: {
      value: true,
      message: t("validation.required"),
    },
  },
  streetNumber: {
    required: {
      value: true,
      message: t("validation.required"),
    },
  },
  postalCode: {
    required: {
      value: true,
      message: t("validation.required"),
    },
    pattern: {
      value: /^\d{2}-\d{3}$/,
      message: t("validation.pattern"),
    },
  },
  city: {
    required: {
      value: true,
      message: t("validation.required"),
    },
  },
  productName: {
    required: {
      value: true,
      message: t("validation.required"),
    },
  },
  category: {
    required: {
      value: true,
      message: t("validation.required"),
    },
  },
  announcementTitle: {
    required: {
      value: true,
      message: t("validation.required"),
    },
  },
  announcementContent: {
    required: {
      value: true,
      message: t("validation.required"),
    },
  },
});
