import dotenv from "dotenv";
import { NextApiRequest, NextApiResponse } from "next";
import { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";
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
  const exchangeETag = req.headers["if-match"];

  const requestURL = `${process.env.MZWZ_API_BASE_URL}/exchanges`;
  const appContentHeaders = {
    headers: {
      Authorization: `Bearer ${token}`,
      "If-Match": exchangeETag,
    },
  };

  const { exchangeId, path } = req.query;
  const { value } = req.body;

  if (req.method === HTTP_PATCH) {
    const patchData = jsonPatchObject(path as string, value);

    const response = await axios
      .patch(`${requestURL}/${exchangeId}`, [patchData], appContentHeaders)
      .then((response) => {
        res.status(response.status).json({
          message: "Product updated successfully",
          exchange: response.data,
        });
      })
      .catch((error: AxiosError) => {
        res
          .status(error.response?.status || HTTP_INTERNAL_SERVER_ERROR)
          .json(error.response?.data || { message: "An error occurred" });
      });
  }
}
