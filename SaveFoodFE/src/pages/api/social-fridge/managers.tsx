import { AxiosError, AxiosResponse } from "axios";
import dotenv from "dotenv";
import { NextApiRequest, NextApiResponse } from "next";
import { HTTP_INTERNAL_SERVER_ERROR } from "../../../constants/httpCodes";
import { HTTP_GET } from "../../../constants/httpMethods";
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
    await axios
      .get(`${process.env.API_BASE_URL}/accounts/managers`, appContentHeaders)
      .then((response) => {
        res.status(response.status).json({
          managers: response.data,
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
