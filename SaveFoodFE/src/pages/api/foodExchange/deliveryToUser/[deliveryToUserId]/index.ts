import dotenv from "dotenv";
import { NextApiRequest, NextApiResponse } from "next";
import { AxiosError, AxiosResponse } from "axios";
import { HTTP_GET } from "../../../../../constants/httpMethods";
import axios from "../../../../../utils/axios/axios";
import { HTTP_INTERNAL_SERVER_ERROR } from "../../../../../constants/httpCodes";

dotenv.config();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const token = req.headers.authorization;
  const requestURL = `${process.env.MZWZ_API_BASE_URL}/user-deliveries`;
  const { deliveryToUserId } = req.query;
  const appContentHeaders = {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };

  if (req.method === HTTP_GET) {
    const response = await axios
      .get(`${requestURL}/${deliveryToUserId}`, appContentHeaders)
      .then((response) => {
        return res.status(response.status).json({
          deliveryToUser: response.data,
          message: "Delivery to user get seccessfully",
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
