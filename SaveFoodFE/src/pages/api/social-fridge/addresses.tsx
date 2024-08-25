import axios, { AxiosError } from "axios";
import dotenv from "dotenv";
import { NextApiRequest, NextApiResponse } from "next";
import { HTTP_PUT } from "../../../constants/httpMethods";
import { HTTP_INTERNAL_SERVER_ERROR } from "../../../constants/httpCodes";

dotenv.config();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const token = req.headers.authorization;
  const addressETag = req.headers["if-match"];
  const appContentHeaders = {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "If-Match": addressETag?.replace(/"/g, ""),
    },
  };
  const requestPath = `${process.env.MZSL_URL}/addresses`;

  if (req.method === HTTP_PUT) {
    const { putData } = req.body;
    await axios
      .put(requestPath, putData, appContentHeaders)
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
