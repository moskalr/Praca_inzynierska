import axios, { AxiosError, AxiosResponse } from "axios";
import dotenv from "dotenv";
import { NextApiRequest, NextApiResponse } from "next";
import { HTTP_GET } from "../../../../constants/httpMethods";
import { HTTP_INTERNAL_SERVER_ERROR } from "../../../../constants/httpCodes";

dotenv.config();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const token = req.headers.authorization;
  const socialFridgeETag = req.headers["if-match"];
  const appContentHeaders = {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };

  const { id } = req.query;
  const requestPath = `${process.env.MZSL_URL}/addresses`;

  if (req.method === HTTP_GET) {
    await axios
      .get(`${requestPath}/${id}`, appContentHeaders)
      .then((response) => {
        res.status(response.status).json({
          eTag: response.headers.etag,
        });
        return;
      })
      .catch((error: AxiosError) => {
        res
          .status(error.response?.status || HTTP_INTERNAL_SERVER_ERROR)
          .json(error.response?.data);
      });
  }
}
