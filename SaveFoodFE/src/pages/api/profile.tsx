import dotenv from "dotenv";
import { NextApiRequest, NextApiResponse } from "next";
import { HTTP_INTERNAL_SERVER_ERROR, HTTP_OK } from "../../constants/httpCodes";
import { HTTP_GET } from "../../constants/httpMethods";
import axios from "../../utils/axios/axios";

dotenv.config();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === HTTP_GET) {
    const token = req.headers.authorization;
    try {
      const config = {
        method: HTTP_GET,
        url: `${process.env.API_BASE_URL}/accounts/_self`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const response = await axios.request(config);

      if (response.status === HTTP_OK) {
        res.status(response.status).json({ account: response.data });
        return;
      }
      res
        .status(response.status)
        .json({ message: "Fetching profile details failed" });
    } catch (error: any) {
      res
        .status(error.response?.status || HTTP_INTERNAL_SERVER_ERROR)
        .json(error.response?.data || { message: "An error occurred" });
    }
    return;
  }
}
