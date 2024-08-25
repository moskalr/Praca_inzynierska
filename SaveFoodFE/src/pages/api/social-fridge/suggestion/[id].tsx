import axios, { AxiosError } from "axios";
import dotenv from "dotenv";
import { NextApiRequest, NextApiResponse } from "next";
import { HTTP_PATCH } from "../../../../constants/httpMethods";
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
  const { id } = req.query;
  const requestPath = `${process.env.MZSL_URL}/suggestions/${id}`;

  if (req.method === HTTP_PATCH) {
    const { value } = req.body;
    const patchData = [
      {
        op: "replace",
        path: "/isNew",
        value: value,
      },
    ];
    await axios
      .patch(requestPath, patchData, appContentHeadersWithETag)
      .then((response) => {
        res.status(response.status).json({
          suggestion: response.data,
        });
        return;
      })
      .catch((error: AxiosError) => {
        return res
          .status(error.response?.status || HTTP_INTERNAL_SERVER_ERROR)
          .json({ error: error.response?.data });
      });
  }
}
