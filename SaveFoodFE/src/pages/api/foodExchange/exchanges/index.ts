import { AxiosError, AxiosResponse } from "axios";
import dotenv from "dotenv";
import { NextApiRequest, NextApiResponse } from "next";
import { HTTP_GET, HTTP_POST } from "../../../../constants/httpMethods";
import axios from "../../../../utils/axios/axios";
import { HTTP_INTERNAL_SERVER_ERROR } from "../../../../constants/httpCodes";

dotenv.config();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const token = req.headers.authorization;
  const requestURL = `${process.env.MZWZ_API_BASE_URL}/exchanges`;
  const appContentHeaders = {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };
  const params = req.query;

  if (req.method === HTTP_GET) {
    const axiosConfig = {
      ...appContentHeaders,
      params,
    };
    const response = await axios
      .get(requestURL, axiosConfig)
      .then((response) => {
        return res.status(response.status).json({
          exchanges: response.data,
          message: "Exchanges get seccessfully",
        });
      })
      .catch((error: AxiosError) => {
        res
          .status(error.response?.status || HTTP_INTERNAL_SERVER_ERROR)
          .json(error.response?.data || { message: "An error occurred" });
        return;
      });
  }

  if (req.method === HTTP_POST) {
    const { productId, mapAddress } = req.body;
    const data = {
      productId,
      deliveryToUser: {
        mapAddress: mapAddress,
      },
    };

    const response = await axios
      .post(requestURL, data, appContentHeaders)
      .then((response) => {
        return res.status(response.status).json({
          exchange: response.data,
          message: "Product reservation has been successfully changed",
        });
      })
      .catch((error: AxiosError) => {
        res
          .status(error.response?.status || HTTP_INTERNAL_SERVER_ERROR)
          .json(error.response?.data || { message: "An error occurred" });
        return;
      });
  }
}
