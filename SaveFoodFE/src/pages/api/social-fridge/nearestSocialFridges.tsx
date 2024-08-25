import axios, { AxiosError, AxiosResponse } from "axios";
import dotenv from "dotenv";
import { NextApiRequest, NextApiResponse } from "next";
import { HTTP_INTERNAL_SERVER_ERROR } from "../../../constants/httpCodes";
import { HTTP_GET } from "../../../constants/httpMethods";

dotenv.config();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const token = req.headers.authorization;

  if (req.method === HTTP_GET) {
    const { latitude, longitude, maxDistance } = req.query;
    const url = `${process.env.MZSL_URL}/fridges/area?latitude=${latitude}&longitude=${longitude}&maxDistance=${maxDistance}`;
    await axios
      .get(url)
      .then((response) => {
        res.status(response.status).json({
          fridges: response.data,
        });
        return;
      })
      .catch((error: AxiosError) => {
        res
          .status(error.response?.status || HTTP_INTERNAL_SERVER_ERROR)
          .json(error.response?.data);
      });
  }
}
