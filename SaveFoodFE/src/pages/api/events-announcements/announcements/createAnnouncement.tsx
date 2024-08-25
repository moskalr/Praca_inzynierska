import dotenv from "dotenv";
import { NextApiRequest, NextApiResponse } from "next";
import { HTTP_POST } from "../../../../constants/httpMethods";
import axios from "../../../../utils/axios/axios";
import {
  HTTP_CREATED,
  HTTP_INTERNAL_SERVER_ERROR,
} from "../../../../constants/httpCodes";

dotenv.config();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const token = req.headers.authorization;
  const queryParams = new URLSearchParams();
  const requestURL = `${process.env.MZWO_BASE_URL}/announcement`;
  const { id } = req.query;
  const appContentHeaders = {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };

  if (req.method === HTTP_POST) {
    try {
      const response = await axios.post(
        requestURL,
        req.body,
        appContentHeaders
      );
      if (response.status === HTTP_CREATED) {
        res.status(response.status).json({
          message: "Announcement created successfully",
          announcement: response.data,
        });
        return;
      }
      res
        .status(response.status)
        .json({ message: "Announcement creation failed" });
    } catch (error: any) {
      res
        .status(error.response?.status || HTTP_INTERNAL_SERVER_ERROR)
        .json(error.response?.data || { message: "An error occurred" });
    }
    return;
  }
}
