export const LANG_PL = "pl";
export const LANG_EN = "en";

export const regexEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
export const regexName = /^.{1,32}$/;
export const regexUsername = /^.{6,16}$/;
export const regexPassword =
  /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()_+])(?!.*\s).{8,}$/;

export const TOKEN = "token";
export const REFRESH_TOKEN = "refreshToken";
