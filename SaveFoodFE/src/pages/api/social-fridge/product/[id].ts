import axios, { AxiosError, AxiosResponse } from "axios";
import dotenv from "dotenv";
import { NextApiRequest, NextApiResponse } from "next";
import { HTTP_GET, HTTP_PUT } from "../../../../constants/httpMethods";
import { HTTP_INTERNAL_SERVER_ERROR } from "../../../../constants/httpCodes";

dotenv.config();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;
  const token = req.headers.authorization;

  if (req.method === HTTP_PUT) {
    const { putData } = req.body;
    const productETag = req.headers["if-match"];
    const appContentHeaders = {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "If-Match": productETag?.replace(/"/g, ""),
      },
    };
    await axios
      .put(`${process.env.MZSL_URL}/products`, putData, appContentHeaders)
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
  if (req.method === HTTP_GET) {
    await axios
      .get(`${process.env.MZSL_URL}/products/${id}`)
      .then((response) => {
        res.status(response.status).json({
          product: response.data,
          eTag: response.headers.etag,
        });
        return;
      })
      .catch((error: AxiosError) => {
        res
          .status(error.response?.status || HTTP_INTERNAL_SERVER_ERROR)
          .json(error.response?.data);
      });
  }
}
