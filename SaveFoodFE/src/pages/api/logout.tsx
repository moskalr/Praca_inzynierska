import dotenv from "dotenv";
import { NextApiRequest, NextApiResponse } from "next";
import {
  HTTP_INTERNAL_SERVER_ERROR,
  HTTP_NO_CONTENT,
} from "../../constants/httpCodes";
import { HTTP_POST } from "../../constants/httpMethods";
import axios from "../../utils/axios/axios";

dotenv.config();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === HTTP_POST) {
    const token = req.headers.authorization;
    try {
      const config = {
        method: HTTP_POST,
        url: `${process.env.API_BASE_URL}/auth/logout`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const response = await axios.request(config);

      if (response.status === HTTP_NO_CONTENT) {
        res.status(HTTP_NO_CONTENT).json({
          message: "Logged out successfully",
          access_token: response.data.access_token,
        });
        return;
      }
      res.status(response.status).json({ message: "Logout failed" });
    } catch (error: any) {
      res
        .status(error.response?.status || HTTP_INTERNAL_SERVER_ERROR)
        .json(error.response?.data || { message: "An error occurred" });
    }
  }
}
