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
  const accountFridgeTag = req.headers["if-match"];
  const { id, page, size, isArchived } = req.query;
  const url = `${process.env.MZPL_URL}/fridges-accounts`;

  const configPatchHeaders = {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "If-Match": accountFridgeTag?.replace(/"/g, ""),
    },
    params: {
      id,
    },
  };

  const configGetHeaders = {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    params: {
      page,
      size,
      isArchived,
    },
  };

  if (req.method === HTTP_PATCH) {
    await axios
      .patch(url, {}, configPatchHeaders)
      .then((response) => {
        return res.status(response.status).json({
          fridge_account: response.data,
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
        return res.status(response.status).json({
          fridges: response.data,
        });
      })
      .catch((error: AxiosError) => {
        return res
          .status(error.response?.status || HTTP_INTERNAL_SERVER_ERROR)
          .json({ error: error.response?.data });
      });
  }
}
