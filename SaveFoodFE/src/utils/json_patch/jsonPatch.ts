import { useState } from "react";
import { set } from "zod";

export const jsonPatchObject = (path: string, value: string | string[]) => {
  let op = "replace";
  if (Array.isArray(value)) {
    op = "add";
  }
  return {
    op: op,
    path: "/" + path,
    value: value,
  };
};

export default jsonPatchObject;
