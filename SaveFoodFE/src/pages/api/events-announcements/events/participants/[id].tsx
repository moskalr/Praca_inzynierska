import dotenv from "dotenv";
import { NextApiRequest, NextApiResponse } from "next";
import { HTTP_GET, HTTP_POST } from "../../../../../constants/httpMethods";
import axios from "../../../../../utils/axios/axios";
import {
  HTTP_INTERNAL_SERVER_ERROR,
  HTTP_OK,
} from "../../../../../constants/httpCodes";
dotenv.config();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const token = req.headers.authorization;
  const queryParams = new URLSearchParams();
  const { id } = req.query;
  const requestURL = `${process.env.MZWO_BASE_URL}/event/participants`;
  const appContentHeaders = {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };

  if (req.method === HTTP_GET) {
    queryParams.append("eventId", String(id));
    try {
      const response = await axios.get(
        `${requestURL}?${queryParams.toString()}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status === HTTP_OK) {
        res.status(response.status).json({ participants: response.data });
        return;
      }
      res
        .status(response.status)
        .json({ message: "Fetching event participants failed" });
    } catch (error: any) {
      res
        .status(error.response?.status || HTTP_INTERNAL_SERVER_ERROR)
        .json(error.response?.data || { message: "An error occurred" });
    }
    return;
  }

  if (req.method === HTTP_POST) {
    const { username, action } = req.body;
    queryParams.append("action", action);
    try {
      const response = await axios.post(
        `${requestURL}/add?${queryParams.toString()}`,
        { username: username, eventId: id },
        appContentHeaders
      );
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
