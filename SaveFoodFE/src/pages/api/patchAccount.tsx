import axios from "../../utils/axios/axios";
import dotenv from "dotenv";
import { HTTP_PATCH } from "../../constants/httpMethods";
import { HTTP_INTERNAL_SERVER_ERROR, HTTP_OK } from "../../constants/httpCodes";
import { NextApiRequest, NextApiResponse } from "next";
import { AxiosError } from "axios";

dotenv.config();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === HTTP_PATCH) {
    const token = req.headers.authorization;
    const { username, patchData } = req.body;

    const config = {
      method: HTTP_PATCH,
      url: `${process.env.API_BASE_URL}/accounts/${username}`,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      data: patchData,
    };

    await axios
      .request(config)
      .then((response: { status: number; data: any }) => {
        res.status(response.status).json({
          account: response.data,
        });
        return;
      })
      .catch((error: AxiosError) => {
        return res
          .status(error.response?.status || HTTP_INTERNAL_SERVER_ERROR)
          .json(error.response?.data || { message: "An error occurred" });
      });
    return;
  }
}
