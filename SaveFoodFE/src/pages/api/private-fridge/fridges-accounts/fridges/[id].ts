import axios, { AxiosError } from "axios";
import { NextApiRequest, NextApiResponse } from "next";
import { HTTP_GET } from "../../../../../constants/httpMethods";
import { HTTP_INTERNAL_SERVER_ERROR } from "../../../../../constants/httpCodes";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const token = req.headers.authorization;
  const { id } = req.query;
  const url = `${process.env.MZPL_URL}/fridges-accounts/fridges/${id}`;

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
        return res.status(response.status).json({ account: response.data });
      })
      .catch((error: AxiosError) => {
        return res
          .status(error.response?.status || HTTP_INTERNAL_SERVER_ERROR)
          .json({ error: error.response?.data });
      });
  }
}
