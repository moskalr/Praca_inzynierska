import { AxiosError } from "axios";
import dotenv from "dotenv";
import { NextApiRequest, NextApiResponse } from "next";
import { HTTP_POST } from "../../../../constants/httpMethods";
import axios from "../../../../utils/axios/axios";
import { HTTP_INTERNAL_SERVER_ERROR } from "../../../../constants/httpCodes";

dotenv.config();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const data = req.body;
  const token = req.headers.authorization;
  const requestURL = `${process.env.MZWZ_API_BASE_URL}/rating-exchanges`;
  const appContentHeaders = {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };

  if (req.method === HTTP_POST) {
    const response = await axios
      .post(requestURL, data, appContentHeaders)
      .then((response) => {
        res.status(response.status).json({
          message: "Rated exchange created successfully",
          ratingExchange: response.data,
        });
        return;
      })
      .catch((error: AxiosError) => {
        res
          .status(error.response?.status || HTTP_INTERNAL_SERVER_ERROR)
          .json(error.response?.data || { message: "An error occurred" });
      });
  }
}
