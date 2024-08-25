import dotenv from "dotenv";
import { HTTP_PATCH } from "../../../../constants/httpMethods";
import {
  HTTP_INTERNAL_SERVER_ERROR,
  HTTP_OK,
} from "../../../../constants/httpCodes";
import { NextApiRequest, NextApiResponse } from "next";
import { AxiosError } from "axios";
import axios from "../../../../utils/axios/axios";

dotenv.config();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === HTTP_PATCH) {
    const token = req.headers.authorization;
    const { updatedEvent } = req.body;
    const eventTag = req.headers["if-match"];
    const patchData = [
      {
        op: "replace",
        path: "/title",
        value: updatedEvent.title,
      },
      {
        op: "replace",
        path: "/state",
        value: updatedEvent.state,
      },
      {
        op: "replace",
        path: "/startDate",
        value: updatedEvent.startDate,
      },
      {
        op: "replace",
        path: "/endDate",
        value: updatedEvent.endDate,
      },
      {
        op: "replace",
        path: "/content",
        value: updatedEvent.content,
      },
      {
        op: "replace",
        path: "/maxParticipants",
        value: updatedEvent.maxParticipants,
      },
      {
        op: "replace",
        path: "/foodQuantity",
        value: updatedEvent.foodQuantity,
      },
      {
        op: "replace",
        path: "/maxReservationQuantity",
        value: updatedEvent.maxReservationQuantity,
      },
      {
        op: "replace",
        path: "/foodUnit",
        value: updatedEvent.foodUnit,
      },
    ];
    try {
      const response = await axios.patch(
        `${process.env.MZWO_BASE_URL}/event/${updatedEvent.id}`,
        patchData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            "If-Match": eventTag?.replace(/"/g, ""),
          },
        }
      );

      if (response.status === HTTP_OK) {
        res.status(response.status).json({
          message: "Event updated successfully",
          event: response.data,
        });
        return;
      }
      res.status(response.status).json({ message: "Event update failed" });
    } catch (error: any) {
      res
        .status(error.response?.status || HTTP_INTERNAL_SERVER_ERROR)
        .json(error.response?.data || { message: "An error occurred" });
    }
    return;
  }
}
