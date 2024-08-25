import axios from "../../utils/axios/axios";
import dotenv from "dotenv";
import { HTTP_GET } from "../../constants/httpMethods";
import { HTTP_INTERNAL_SERVER_ERROR, HTTP_OK } from "../../constants/httpCodes";
import { NextApiRequest, NextApiResponse } from "next";

dotenv.config();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === HTTP_GET) {
    const token = req.headers.authorization;
    const { username } = req.query;
    try {
      const config = {
        method: HTTP_GET,
        url: `${process.env.API_BASE_URL}/accounts`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          username,
        },
      };

      const response = await axios.request(config);

      if (response.status === HTTP_OK) {
        res.status(response.status).json({ accounts: response.data });
        return;
      }
      res.status(response.status).json({ message: "Fetching accounts failed" });
    } catch (error: any) {
      res
        .status(error.response?.status || HTTP_INTERNAL_SERVER_ERROR)
        .json(error.response?.data || { message: "An error occurred" });
    }
    return;
  }
}
