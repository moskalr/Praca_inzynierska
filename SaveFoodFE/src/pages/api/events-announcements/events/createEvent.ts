import axios from "../../../../utils/axios/axios";
import dotenv from "dotenv";
import { HTTP_PATCH, HTTP_POST } from "../../../../constants/httpMethods";
import {
  HTTP_INTERNAL_SERVER_ERROR,
  HTTP_OK,
} from "../../../../constants/httpCodes";
import { NextApiRequest, NextApiResponse } from "next";

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
        url: `${process.env.MZWO_BASE_URL}/event`,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        data: req.body,
      };

      const response = await axios.request(config);

      if (response.status === HTTP_OK) {
        res.status(response.status).json({
          message: "Event updated successfully",
          account: response.data,
        });
        return;
      }
      res.status(response.status).json({ message: "Event update failed" });
    } catch (error: any) {
      res
        .status(error.response?.status || HTTP_INTERNAL_SERVER_ERROR)
        .json(error.response?.data || { message: "An error occurred" });
    }
    return;
  }
}
