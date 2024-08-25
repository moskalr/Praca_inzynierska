export const HomePageValidation = (t: Function) => ({
  distance: {
    pattern: {
      value: /^(0(\.\d{1,2})?|[1-9]\d*(\.\d{1,2})?)$/,
      message: t("landing_page.validNumber"),
    },
  },
});
