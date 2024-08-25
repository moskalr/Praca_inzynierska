import { AxiosError } from "axios";
import { NextApiRequest, NextApiResponse } from "next";
import { HTTP_POST } from "../../../../constants/httpMethods";
import axios from "../../../../utils/axios/axios";
import { HTTP_INTERNAL_SERVER_ERROR } from "../../../../constants/httpCodes";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const token = req.headers.authorization;
  const { data } = req.body;
  const url = `${process.env.MZPL_URL}/fridges`;

  const configPostHeaders = {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };

  if (req.method === HTTP_POST) {
    await axios
      .post(url, data, configPostHeaders)
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
