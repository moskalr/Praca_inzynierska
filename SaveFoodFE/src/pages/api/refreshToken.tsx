import dotenv from "dotenv";
import { NextApiRequest, NextApiResponse } from "next";
import { HTTP_INTERNAL_SERVER_ERROR, HTTP_OK } from "../../constants/httpCodes";
import { HTTP_POST } from "../../constants/httpMethods";
import axios from "../../utils/axios/axios";

dotenv.config();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === HTTP_POST) {
    const { refreshToken } = req.body;
    const data = new URLSearchParams();
    data.append("client_id", "food_rescue");
    data.append("grant_type", "refresh_token");
    data.append("refresh_token", refreshToken);

    try {
      const config = {
        method: HTTP_POST,
        url: `${process.env.KEYCLOAK_API}/protocol/openid-connect/token`,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        data: data,
      };

      const response = await axios.request(config);

      if (response.status === HTTP_OK) {
        res.status(HTTP_OK).json({
          access_token: response.data.access_token,
          refresh_token: response.data.refresh_token,
        });
        return;
      }
      res.status(response.status).json({ message: "Refresh token failed" });
    } catch (error: any) {
      res
        .status(error.response?.status || HTTP_INTERNAL_SERVER_ERROR)
        .json(error.response?.data || { message: "An error occurred" });
    }
  }
}
