import axios from "../../utils/axios/axios";
import dotenv from "dotenv";
import { HTTP_POST } from "../../constants/httpMethods";
import {
  HTTP_INTERNAL_SERVER_ERROR,
  HTTP_NO_CONTENT,
} from "../../constants/httpCodes";
import { NextApiRequest, NextApiResponse } from "next";

dotenv.config();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === HTTP_POST) {
    const { email } = req.body;

    const data = new FormData();
    data.append("email", email);

    try {
      const config = {
        method: HTTP_POST,
        url: `${process.env.API_BASE_URL}/accounts/reset-password`,
        headers: {
          "Content-Type": "application/json",
        },
        data: data,
      };

      const response = await axios.request(config);

      if (response.status === HTTP_NO_CONTENT) {
        res
          .status(response.status)
          .json({ message: "Password reset initialized sucessfully" });
        return;
      }
      res
        .status(response.status)
        .json({ message: "Password reset initialization failed" });
    } catch (error: any) {
      res
        .status(error.response?.status || HTTP_INTERNAL_SERVER_ERROR)
        .json(error.response?.data || { message: "An error occurred" });
    }
    return;
  }
}
