import { AxiosError } from "axios";
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
    const { states, page, size } = req.query;
    await axios
      .get(
        `${process.env.MZSL_URL}/fridges/managed-social-fridges?states=${states}&page=${page}&size=${size}`,
        appContentHeaders
      )
      .then((response) => {
        res.status(response.status).json({
          fridges: response.data,
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
