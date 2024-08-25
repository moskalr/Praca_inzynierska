import dotenv from "dotenv";
import { NextApiRequest, NextApiResponse } from "next";
import { HTTP_GET } from "../../../../../constants/httpMethods";
import axios from "../../../../../utils/axios/axios";
import { HTTP_INTERNAL_SERVER_ERROR } from "../../../../../constants/httpCodes";

dotenv.config();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const token = req.headers.authorization;
  const authorization = { Authorization: `Bearer ${token}` };
  const { productId } = req.query;
  const appContentHeaders = {
    headers: {
      "Content-Type": "application/json",
    },
  };
  if (token !== "") {
    Object.assign(appContentHeaders.headers, authorization);
  }
  const requestURL = `${process.env.MZWZ_API_BASE_URL}/products`;

  if (req.method === HTTP_GET) {
    await axios
      .get(`${requestURL}/${productId}`, appContentHeaders)
      .then((response) => {
        return res.status(response.status).json({
          message: "Product updated successfully",
          product: response.data,
        });
      })
      .catch((error) => {
        console.log("error", error);

        return res
          .status(error.response?.status || HTTP_INTERNAL_SERVER_ERROR)
          .json(error.response?.data || { message: "An error occurred" });
      });
  }
}
