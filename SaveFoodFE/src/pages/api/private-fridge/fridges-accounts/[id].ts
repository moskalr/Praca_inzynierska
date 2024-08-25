import { AxiosError } from "axios";
import { NextApiRequest, NextApiResponse } from "next";
import { HTTP_GET, HTTP_PATCH } from "../../../../constants/httpMethods";
import axios from "../../../../utils/axios/axios";
import { HTTP_INTERNAL_SERVER_ERROR } from "../../../../constants/httpCodes";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const token = req.headers.authorization;
  const accountTag = req.headers["if-match"];
  const { id } = req.query;
  const { role, enabled } = req.body;
  const url = `${process.env.MZPL_URL}/fridges-accounts/${id}`;

  const configPatchHeaders = {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "If-Match": accountTag?.replace(/"/g, ""),
    },
  };

  const configGetHeaders = {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };

  if (req.method === HTTP_PATCH) {
    const patchData = [
      {
        op: "replace",
        path: "/role",
        value: role,
      },
      {
        op: "replace",
        path: "/enabled",
        value: enabled,
      },
    ];

    await axios
      .patch(url, patchData, configPatchHeaders)
      .then((response) => {
        return res.status(response.status).json({
          account: response.data,
        });
      })
      .catch((error: AxiosError) => {
        return res
          .status(error.response?.status || HTTP_INTERNAL_SERVER_ERROR)
          .json({ error: error.response?.data });
      });
  }

  if (req.method === HTTP_GET) {
    await axios
      .get(url, configGetHeaders)
      .then((response) => {
        return res
          .status(response.status)
          .json({ fridge_account: response.data, etag: response.headers.etag });
      })
      .catch((error: AxiosError) => {
        return res
          .status(error.response?.status || HTTP_INTERNAL_SERVER_ERROR)
          .json({ error: error.response?.data });
      });
  }
}
