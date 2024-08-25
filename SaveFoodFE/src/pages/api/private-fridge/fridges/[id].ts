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
  const privateFridgeTag = req.headers["if-match"];
  const { id } = req.query;
  const url = `${process.env.MZPL_URL}/fridges/${id}`;

  const configPatchHeaders = {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "If-Match": privateFridgeTag?.replace(/"/g, ""),
    },
  };

  const configGetHeaders = {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };

  if (req.method === HTTP_PATCH) {
    const { title, description, isArchived } = req.body;

    const patchData = [
      {
        op: "replace",
        path: "/title",
        value: title,
      },
      {
        op: "replace",
        path: "/description",
        value: description,
      },
      {
        op: "replace",
        path: "/archived",
        value: isArchived,
      },
    ];

    await axios
      .patch(url, patchData, configPatchHeaders)
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

  if (req.method === HTTP_GET) {
    await axios
      .get(url, configGetHeaders)
      .then((response) => {
        return res
          .status(response.status)
          .json({ fridge: response.data, etag: response.headers.etag });
      })
      .catch((error: AxiosError) => {
        return res
          .status(error.response?.status || HTTP_INTERNAL_SERVER_ERROR)
          .json({ error: error.response?.data });
      });
  }
}
