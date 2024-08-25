import { AxiosError } from "axios";
import dotenv from "dotenv";
import { NextApiRequest, NextApiResponse } from "next";
import { HTTP_PATCH } from "../../../../../constants/httpMethods";
import jsonPatchObject from "../../../../../utils/json_patch/jsonPatch";
import axios from "../../../../../utils/axios/axios";
import { HTTP_INTERNAL_SERVER_ERROR } from "../../../../../constants/httpCodes";

dotenv.config();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { deliveryToUserId, path } = req.query;
  const deliveryToUserETag = req.headers["if-match"];
  const token = req.headers.authorization;
  const queryParams = new URLSearchParams();
  const requestURL = `${process.env.MZWZ_API_BASE_URL}/user-deliveries`;
  const appContentHeaders = {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "If-Match": deliveryToUserETag,
    },
  };

  if (req.method === HTTP_PATCH) {
    const { value } = req.body;
    const patchData = jsonPatchObject(path as string, value);

    const response = await axios
      .patch(
        `${requestURL}/${deliveryToUserId}`,
        [patchData],
        appContentHeaders
      )
      .then((response) => {
        res.status(response.status).json({
          message: "Delivery to user updated successfully",
          deliveryToUser: response.data,
        });
        return;
      })
      .catch((error: AxiosError) => {
        res
          .status(error.response?.status || HTTP_INTERNAL_SERVER_ERROR)
          .json(error.response?.data || { message: "An error occurred" });
      });
  }
}
