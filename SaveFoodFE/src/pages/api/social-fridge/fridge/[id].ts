import axios, { AxiosError } from "axios";
import dotenv from "dotenv";
import { NextApiRequest, NextApiResponse } from "next";
import {
  HTTP_GET,
  HTTP_PATCH,
  HTTP_PUT,
} from "../../../../constants/httpMethods";
import { HTTP_INTERNAL_SERVER_ERROR } from "../../../../constants/httpCodes";

dotenv.config();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const token = req.headers.authorization;
  const eTag = req.headers["if-match"];

  const appContentHeadersWithETag = {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "If-Match": eTag?.replace(/"/g, ""),
    },
  };
  const appContentHeaders = {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };
  const { id } = req.query;
  const requestPath = `${process.env.MZSL_URL}/fridges`;

  if (req.method === HTTP_GET) {
    await axios
      .get(`${requestPath}/${id}`)
      .then((response) => {
        res.status(response.status).json({
          fridge: response.data,
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

  if (req.method === HTTP_PATCH) {
    const { value, path } = req.body;
    const patchData = [
      {
        op: "replace",
        path: path,
        value: value,
      },
    ];

    await axios
      .patch(`${requestPath}/${id}`, patchData, appContentHeadersWithETag)
      .then((response) => {
        res.status(response.status).json({
          fridge: response.data,
        });
        return;
      })
      .catch((error: AxiosError) => {
        return res
          .status(error.response?.status || HTTP_INTERNAL_SERVER_ERROR)
          .json({ error: error.response?.data });
      });
  }

  if (req.method === HTTP_PUT) {
    const { putData } = req.body;

    await axios
      .put(`${requestPath}/notifications`, putData, appContentHeaders)
      .then((response) => {
        res.status(response.status).json({});
        return;
      })
      .catch((error: AxiosError) => {
        return res
          .status(error.response?.status || HTTP_INTERNAL_SERVER_ERROR)
          .json({ error: error.response?.data });
      });
  }
}
