import dotenv from "dotenv";
import { NextApiRequest, NextApiResponse } from "next";
import { HTTP_PATCH } from "../../../../../constants/httpMethods";
import jsonPatchObject from "../../../../../utils/json_patch/jsonPatch";
import axios from "../../../../../utils/axios/axios";
import { HTTP_INTERNAL_SERVER_ERROR } from "../../../../../constants/httpCodes";

dotenv.config();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const token = req.headers.authorization;
  const productETag = req.headers["if-match"];
  const authorization = { Authorization: `Bearer ${token}` };
  const { productId, path } = req.query;
  const appContentHeaders = {
    headers: {
      "Content-Type": "application/json",
      "If-Match": productETag,
    },
  };
  if (token !== "") {
    Object.assign(appContentHeaders.headers, authorization);
  }
  const requestURL = `${process.env.MZWZ_API_BASE_URL}/products`;
  const { value } = req.body;

  if (req.method === HTTP_PATCH) {
    const patchData = jsonPatchObject(path as string, value);
    await axios
      .patch(`${requestURL}/${productId}`, [patchData], appContentHeaders)
      .then((response) => {
        return res.status(response.status).json({
          message: "Product updated successfully",
          product: response.data,
        });
      })
      .catch((error) => {
        return res
          .status(error.response?.status || HTTP_INTERNAL_SERVER_ERROR)
          .json(error.response?.data || { message: "An error occurred" });
      });
  }
}
