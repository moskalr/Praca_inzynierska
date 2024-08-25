import dotenv from "dotenv";
import { NextApiRequest, NextApiResponse } from "next";
import { AxiosError, AxiosResponse } from "axios";
import { HTTP_GET, HTTP_POST } from "../../../../constants/httpMethods";
import axios from "../../../../utils/axios/axios";
import { HTTP_INTERNAL_SERVER_ERROR } from "../../../../constants/httpCodes";

dotenv.config();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const token = req.headers.authorization;
  const requestURL = `${process.env.MZWZ_API_BASE_URL}/user-deliveries`;
  const appContentHeaders = {
    headers: {
      Authorization: `Bearer ${token}`,
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
        res.status(response.status).json({
          message: "Deliveries to user get successfully",
          deliveriesToUser: response.data,
        });
        return;
      })
      .catch((error: AxiosError) => {
        res
          .status(error.response?.status || HTTP_INTERNAL_SERVER_ERROR)
          .json(error.response?.data || { message: "An error occurred" });
      });
  }

  if (req.method === HTTP_POST) {
    const { exchangeId, deliveryMapAddress } = req.body;

    const response = await axios
      .post(requestURL, { exchangeId, deliveryMapAddress }, appContentHeaders)
      .then((response) => {
        return res.status(response.status).json({
          deliveriesToUser: response.data,
          message: "Deliveries to user create seccessfully",
        });
      })
      .catch((error: AxiosError) => {
        res
          .status(error.response?.status || HTTP_INTERNAL_SERVER_ERROR)
          .json(error.response?.data || { message: "An error occurred" });
      });
  }
}
