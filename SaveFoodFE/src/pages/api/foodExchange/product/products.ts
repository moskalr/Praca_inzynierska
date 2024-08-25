import { AxiosError } from "axios";
import dotenv from "dotenv";
import { NextApiRequest, NextApiResponse } from "next";
import {
  HTTP_GET,
  HTTP_POST,
  HTTP_PUT,
} from "../../../../constants/httpMethods";
import axios from "../../../../utils/axios/axios";
import { HTTP_INTERNAL_SERVER_ERROR } from "../../../../constants/httpCodes";

dotenv.config();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const productETag = req.headers["if-match"];

  const token = req.headers.authorization;
  const authorization = { Authorization: `Bearer ${token}` };
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
  const params = req.query;
  if (req.method === HTTP_GET) {
    const axiosConfig = {
      ...appContentHeaders,
      params,
    };

    await axios
      .get(requestURL, axiosConfig)
      .then((response) => {
        return res.status(response.status).json({
          message: "Products get seccessfully",
          products: response.data,
        });
      })
      .catch((error) => {
        res
          .status(error.response?.status || HTTP_INTERNAL_SERVER_ERROR)
          .json(error.response?.data || { message: "An error occurred" });
        return res;
      });
  }

  if (req.method === HTTP_POST) {
    await axios
      .post(requestURL, req.body, appContentHeaders)
      .then((response) => {
        return res.status(response.status).json({
          product: response.data,
          message: "Product create seccessfully",
        });
      })
      .catch((error: AxiosError) => {
        return res
          .status(error.response?.status || HTTP_INTERNAL_SERVER_ERROR)
          .json(error.response?.data || { message: "An error occurred" });
      });
  }

  if (req.method === HTTP_PUT) {
    await axios
      .put(requestURL, req.body, appContentHeaders)
      .then((response) => {
        return res.status(response.status).json({
          product: response.data,
          message: "Product update seccessfully",
        });
      })
      .catch((error) => {
        res
          .status(error.response?.status || HTTP_INTERNAL_SERVER_ERROR)
          .json(error.response?.data || { message: "An error occurred" });
      });
  }
}
