import { AxiosError } from "axios";
import dotenv from "dotenv";
import { NextApiRequest, NextApiResponse } from "next";
import { HTTP_INTERNAL_SERVER_ERROR } from "../../../constants/httpCodes";
import { HTTP_GET, HTTP_POST } from "../../../constants/httpMethods";
import axios from "../../../utils/axios/axios";
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
  const requestPath = `${process.env.MZSL_URL}/suggestions`;

  if (req.method === HTTP_GET) {
    const { isNew, page, size } = req.query;
    await axios
      .get(
        `${requestPath}?isNew=${isNew}&size=${size}&page=${page}`,
        appContentHeaders
      )
      .then((response) => {
        res.status(response.status).json({
          suggestions: response.data,
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
          suggestion: response.data,
        });
      })
      .catch((error: AxiosError) => {
        return res
          .status(error.response?.status || HTTP_INTERNAL_SERVER_ERROR)
          .json({ error: error.response?.data });
      });
  }
}
