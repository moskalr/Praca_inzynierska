import { AxiosError } from "axios";
import dotenv from "dotenv";
import { NextApiRequest, NextApiResponse } from "next";
import { HTTP_GET, HTTP_POST } from "../../../constants/httpMethods";
import axios from "../../../utils/axios/axios";
import { HTTP_INTERNAL_SERVER_ERROR } from "../../../constants/httpCodes";

dotenv.config();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const token = req.headers.authorization;
  const appContentHeaders = {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };
  const requestPath = `${process.env.MZSL_URL}/fridges`;

  if (req.method === HTTP_GET) {
    const { states } = req.query;
    await axios
      .get(`${requestPath}?states=${states}`)
      .then((response) => {
        res.status(response.status).json({
          fridges: response.data,
        });
        return;
      })
      .catch((error: AxiosError) => {
        res
          .status(error.response?.status || HTTP_INTERNAL_SERVER_ERROR)
          .json(error.response?.data);
      });
  }

  if (req.method === HTTP_POST) {
    const { postData } = req.body;
    await axios
      .post(requestPath, postData, appContentHeaders)
      .then((response) => {
        return res.status(response.status).json({
          fridge: response.data,
        });
      })
      .catch((error: AxiosError) => {
        return res
          .status(error.response?.status || HTTP_INTERNAL_SERVER_ERROR)
          .json({ error: error.response?.data });
      });
  }
}
