import dotenv from "dotenv";
import { NextApiRequest, NextApiResponse } from "next";
import { HTTP_GET } from "../../../../constants/httpMethods";
import axios from "../../../../utils/axios/axios";
import {
  HTTP_INTERNAL_SERVER_ERROR,
  HTTP_OK,
} from "../../../../constants/httpCodes";

dotenv.config();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const queryParams = new URLSearchParams();
  const requestURL = `${process.env.MZWO_BASE_URL}/event`;
  const token = req.headers.authorization;
  const authorization = { Authorization: `Bearer ${token}` };
  const headers = {};
  if (token !== "") {
    Object.assign(headers, authorization);
  }
  const { id } = req.query;
  if (req.method === HTTP_GET) {
    queryParams.append("eventId", String(id));
    try {
      const response = await axios.get(
        `${requestURL}/id?${queryParams.toString()}`,
        { headers }
      );
      if (response.status === HTTP_OK) {
        res.status(response.status).json({
          event: response.data,
          etag: response.headers.etag,
        });
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
