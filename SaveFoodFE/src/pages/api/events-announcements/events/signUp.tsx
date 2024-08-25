import dotenv from "dotenv";
import { NextApiRequest, NextApiResponse } from "next";
import {
  HTTP_INTERNAL_SERVER_ERROR,
  HTTP_OK,
} from "../../../../constants/httpCodes";
import { HTTP_GET, HTTP_POST } from "../../../../constants/httpMethods";
import axios from "../../../../utils/axios/axios";

dotenv.config();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === HTTP_POST) {
    const token = req.headers.authorization;
    const { id, action } = req.query;
    try {
      const config = {
        method: HTTP_POST,
        url: `${process.env.MZWO_BASE_URL}/event/action?eventId=${id}&action=${action}`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const response = await axios.request(config);

      if (response.status === HTTP_OK) {
        res.status(response.status).json({ event: response.data });
        return;
      }
      res.status(response.status).json({ message: "Fetching event failed" });
    } catch (error: any) {
      res
        .status(error.response?.status || HTTP_INTERNAL_SERVER_ERROR)
        .json(error.response?.data || { message: "An error occurred" });
    }
    return;
  }
}
