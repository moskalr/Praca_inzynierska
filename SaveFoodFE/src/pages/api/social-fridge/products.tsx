import { AxiosError, AxiosResponse } from "axios";
import dotenv from "dotenv";
import { NextApiRequest, NextApiResponse } from "next";
import { HTTP_INTERNAL_SERVER_ERROR } from "../../../constants/httpCodes";
import { HTTP_GET, HTTP_POST } from "../../../constants/httpMethods";
import axios from "../../../utils/axios/axios";
dotenv.config();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const token = req.headers.authorization;
  const appContentHeaders = {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };

  if (req.method === HTTP_GET) {
    const { page, size, category, title } = req.query;
    const queryParams = [];
    if (category) {
      queryParams.push(`category=${category}`);
    }
    if (title) {
      queryParams.push(`title=${title}`);
    }
    if (page) {
      queryParams.push(`page=${page}`);
    }
    if (size) {
      queryParams.push(`size=${size}`);
    }

    const fullPath = `${process.env.MZSL_URL}/products${
      queryParams.length > 0 ? `?${queryParams.join("&")}` : ""
    }`;

    await axios
      .get(fullPath)
      .then((response) => {
        res.status(response.status).json({
          products: response.data,
        });
        return;
      })
      .catch((error: AxiosError) => {
        res
          .status(error.response?.status || HTTP_INTERNAL_SERVER_ERROR)
          .json(error.response?.data);
      });
  }

  if (req.method === HTTP_POST) {
    const { postData } = req.body;
    await axios
      .post(`${process.env.MZSL_URL}/products`, postData, appContentHeaders)
      .then((response) => {
        return res.status(response.status).json({
          product: response.data,
        });
      })
      .catch((error: AxiosError) => {
        return res
          .status(error.response?.status || HTTP_INTERNAL_SERVER_ERROR)
          .json({ error: error.response?.data });
      });
  }
}
