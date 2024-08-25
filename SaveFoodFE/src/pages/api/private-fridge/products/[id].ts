import { AxiosError } from "axios";
import { NextApiRequest, NextApiResponse } from "next";
import { HTTP_GET, HTTP_PUT } from "../../../../constants/httpMethods";
import axios from "../../../../utils/axios/axios";
import { HTTP_INTERNAL_SERVER_ERROR } from "../../../../constants/httpCodes";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const token = req.headers.authorization;
  const productTag = req.headers["if-match"];
  const { id } = req.query;
  const { quantity, productStatus } = req.body;
  const url = `${process.env.MZPL_URL}/products/${id}`;

  const configPutHeaders = {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "If-Match": productTag?.replace(/"/g, ""),
    },
  };

  const configGetHeaders = {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };

  if (req.method === HTTP_GET) {
    await axios
      .get(url, configGetHeaders)
      .then((response) => {
        return res
          .status(response.status)
          .json({ product: response.data, etag: response.headers.etag });
      })
      .catch((error: AxiosError) => {
        return res
          .status(error.response?.status || HTTP_INTERNAL_SERVER_ERROR)
          .json({ error: error.response?.data });
      });
  }

  if (req.method === HTTP_PUT) {
    const putData = {
      quantity: quantity,
      productStatus: productStatus,
    };

    await axios
      .put(url, putData, configPutHeaders)
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
