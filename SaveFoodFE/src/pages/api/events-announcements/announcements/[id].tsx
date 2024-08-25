import dotenv from "dotenv";
import { NextApiRequest, NextApiResponse } from "next";
import {
  HTTP_INTERNAL_SERVER_ERROR,
  HTTP_OK,
} from "../../../../constants/httpCodes";
import { HTTP_GET, HTTP_PATCH } from "../../../../constants/httpMethods";
import axios from "../../../../utils/axios/axios";

dotenv.config();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const token = req.headers.authorization;
  const queryParams = new URLSearchParams();
  const requestURL = `${process.env.MZWO_BASE_URL}/announcement`;
  const { id } = req.query;
  const announcementTag = req.headers["if-match"];
  const appContentHeaders = {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "If-Match": announcementTag?.replace(/"/g, ""),
    },
  };

  if (req.method === HTTP_GET) {
    queryParams.append("announcementId", String(id));
    try {
      const response = await axios.get(
        `${requestURL}/id?${queryParams.toString()}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status === HTTP_OK) {
        res
          .status(response.status)
          .json({ announcement: response.data, etag: response.headers.etag });
        return;
      }
      res
        .status(response.status)
        .json({ message: "Fetching announcement failed" });
    } catch (error: any) {
      res
        .status(error.response?.status || HTTP_INTERNAL_SERVER_ERROR)
        .json(error.response?.data || { message: "An error occurred" });
    }
    return;
  }

  if (req.method === HTTP_PATCH) {
    const { title, content, state } = req.body;
    try {
      const patchData = [
        {
          op: "replace",
          path: "/title",
          value: title,
        },
        {
          op: "replace",
          path: "/content",
          value: content,
        },
        {
          op: "replace",
          path: "/state",
          value: state,
        },
      ];

      const response = await axios.patch(
        `${requestURL}/${id}`,
        patchData,
        appContentHeaders
      );

      if (response.status === HTTP_OK) {
        res.status(response.status).json({
          message: "Announcement updated successfully",
          announcement: response.data,
        });
        return;
      }
      res
        .status(response.status)
        .json({ message: "Announcement update failed" });
    } catch (error: any) {
      res
        .status(error.response?.status || HTTP_INTERNAL_SERVER_ERROR)
        .json(error.response?.data || { message: "An error occurred" });
    }
    return;
  }
}
