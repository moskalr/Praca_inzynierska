import dotenv from "dotenv";
import { NextApiRequest, NextApiResponse } from "next";
import { HTTP_GET } from "../../../../constants/httpMethods";
import {
  HTTP_INTERNAL_SERVER_ERROR,
  HTTP_OK,
} from "../../../../constants/httpCodes";
import axios from "../../../../utils/axios/axios";

dotenv.config();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const requestURL = `${process.env.MZWO_BASE_URL}/accounts/statistics`;
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
      });
      if (response.status === HTTP_OK) {
        res.status(response.status).json({ statistics: response.data });
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
