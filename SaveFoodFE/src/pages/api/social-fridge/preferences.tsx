import { AxiosError, AxiosResponse } from "axios";
import dotenv from "dotenv";
import { NextApiRequest, NextApiResponse } from "next";
import { HTTP_INTERNAL_SERVER_ERROR } from "../../../constants/httpCodes";
import { HTTP_GET, HTTP_PATCH } from "../../../constants/httpMethods";
import axios from "../../../utils/axios/axios";

dotenv.config();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const token = req.headers.authorization;
  const accountETag = req.headers["if-match"];
  const appContentHeadersWithETag = {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "If-Match": accountETag?.replace(/"/g, ""),
    },
  };
  const appContentHeaders = {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };
  const requestPath = `${process.env.MZSL_URL}/accounts/preferences`;

  if (req.method === HTTP_GET) {
    await axios
      .get(requestPath, appContentHeaders)
      .then((response) => {
        res.status(response.status).json({
          preferences: response.data,
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
    const { categories, socialFridges } = req.body;
    const patchData = [
      {
        op: "replace",
        path: "/favCategories",
        value: categories,
      },
      {
        op: "replace",
        path: "/favSocialFridgesId",
        value: socialFridges,
      },
    ];
    await axios
      .patch(
        `${process.env.MZSL_URL}/accounts`,
        patchData,
        appContentHeadersWithETag
      )
      .then((response) => {
        res.status(response.status).json({
          preferences: response.data,
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
