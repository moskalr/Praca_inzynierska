import axios from "../../../../utils/axios/axios";
import dotenv from "dotenv";
import { HTTP_GET } from "../../../../constants/httpMethods";
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
  const requestURL = `${process.env.MZWO_BASE_URL}/event`;
  const params = req.query;
  const token = req.headers.authorization;
  const authorization = { Authorization: `Bearer ${token}` };
  const headers = {};
  if (token !== "") {
    Object.assign(headers, authorization);
  }
  if (req.method === HTTP_GET) {
    try {
      const response = await axios.get(`${requestURL}`, {
        headers,
        params,
      });
      if (response.status === HTTP_OK) {
        res.status(response.status).json({ events: response.data });
        response.data;
        return;
      }
      res.status(response.status).json({ message: "Fetching events failed" });
    } catch (error: any) {
      res
        .status(error.response?.status || HTTP_INTERNAL_SERVER_ERROR)
        .json(error.response?.data || { message: "An error occurred" });
    }
    return;
  }
}
