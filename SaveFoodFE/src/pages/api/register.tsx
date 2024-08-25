import { HTTP_INTERNAL_SERVER_ERROR, HTTP_OK } from "../../constants/httpCodes";
import axios from "../../utils/axios/axios";
import dotenv from "dotenv";
import { HTTP_POST } from "../../constants/httpMethods";
import { NextApiRequest, NextApiResponse } from "next";

dotenv.config();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === HTTP_POST) {
    const data = req.body;

    try {
      const config = {
        method: HTTP_POST,
        url: `${process.env.API_BASE_URL}/accounts`,
        headers: {
          "Content-Type": "application/json",
        },
        data: data,
      };

      const response = await axios.request(config);

      if (response.status === HTTP_OK) {
        res.status(HTTP_OK).json({
          message: "Registered successfully",
        });
        return;
      }
      res.status(response.status).json({ message: "Register failed" });
    } catch (error: any) {
      res
        .status(error.response?.status || HTTP_INTERNAL_SERVER_ERROR)
        .json(error.response?.data || { message: "An error occurred" });
    }
  } else {
  }
}
