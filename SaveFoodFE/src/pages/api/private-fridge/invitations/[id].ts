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
  const invitationTag = req.headers["if-match"];
  const { id } = req.query;
  const url = `${process.env.MZPL_URL}/invitations/${id}`;

  const configPatchHeaders = {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "If-Match": invitationTag?.replace(/"/g, ""),
    },
  };

  const configGetHeaders = {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };

  if (req.method === HTTP_GET) {
    await axios
      .get(url, configGetHeaders)
      .then((response) => {
        return res
          .status(response.status)
          .json({ invitation: response.data, etag: response.headers.etag });
      })
      .catch((error: AxiosError) => {
        return res
          .status(error.response?.status || HTTP_INTERNAL_SERVER_ERROR)
          .json({ error: error.response?.data });
      });
  }

  if (req.method === HTTP_PATCH) {
    const { status } = req.body;

    const patchData = [
      {
        op: "replace",
        path: "/status",
        value: status,
      },
    ];

    await axios
      .patch(url, patchData, configPatchHeaders)
      .then((response) => {
        return res.status(response.status).json({
          invitation: response.data,
        });
      })
      .catch((error: AxiosError) => {
        return res
          .status(error.response?.status || HTTP_INTERNAL_SERVER_ERROR)
          .json({ error: error.response?.data });
      });
  }
}
