import { AxiosError } from "axios";
import { NextApiRequest, NextApiResponse } from "next";
import { HTTP_GET, HTTP_POST } from "../../../../constants/httpMethods";
import axios from "../../../../utils/axios/axios";
import { HTTP_INTERNAL_SERVER_ERROR } from "../../../../constants/httpCodes";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const token = req.headers.authorization;
  const url = `${process.env.MZPL_URL}/invitations`;
  const { page, size, privateFridgeId, status } = req.query;
  const { username, role, fridgeId } = req.body;

  const configGetHeaders = {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    params: {
      page,
      size,
      privateFridgeId,
      status,
    },
  };

  const configPostHeaders = {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };

  if (req.method === HTTP_GET) {
    await axios
      .get(url, configGetHeaders)
      .then((response) => {
        return res.status(response.status).json({
          invitations: response.data,
        });
      })
      .catch((error: AxiosError) => {
        return res
          .status(error.response?.status || HTTP_INTERNAL_SERVER_ERROR)
          .json({ error: error.response?.data });
      });
  }

  if (req.method === HTTP_POST) {
    const postData = {
      receiverUsername: username,
      privateFridgeId: fridgeId,
      role: role,
    };

    await axios
      .post(url, postData, configPostHeaders)
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