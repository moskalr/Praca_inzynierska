import dotenv from "dotenv";
import { NextApiRequest, NextApiResponse } from "next";
import {
  HTTP_GET,
  HTTP_PATCH,
  HTTP_POST,
  HTTP_PUT,
} from "../../../../../constants/httpMethods";
import axios from "../../../../../utils/axios/axios";
import {
  HTTP_CREATED,
  HTTP_INTERNAL_SERVER_ERROR,
  HTTP_OK,
} from "../../../../../constants/httpCodes";
dotenv.config();

interface AppContentHeaders {
  headers: {
    Authorization: string;
    "Content-Type": string;
    [key: string]: string;
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const token = req.headers.authorization;
  const queryParams = new URLSearchParams();
  const requestURL = `${process.env.MZWO_BASE_URL}/reservations`;
  const { id } = req.query;
  const reserevationTag = req.headers["if-match"];
  const appContentHeaders: AppContentHeaders = {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };
  if (reserevationTag) {
    appContentHeaders.headers["If-Match"] = reserevationTag.replace(
      /"/g,
      ""
    ) as string;
  }

  if (req.method === HTTP_GET) {
    queryParams.append("eventId", String(id));
    try {
      const response = await axios.get(
        `${requestURL}/events?${queryParams.toString()}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status === HTTP_OK) {
        res.status(response.status).json({ reservations: response.data });
        return;
      }
      res
        .status(response.status)
        .json({ message: "Fetching reservations failed" });
    } catch (error: any) {
      res
        .status(error.response?.status || HTTP_INTERNAL_SERVER_ERROR)
        .json(error.response?.data || { message: "An error occurred" });
    }
    return;
  }

  if (req.method === HTTP_POST) {
    try {
      const response = await axios.post(
        requestURL,
        req.body,
        appContentHeaders
      );
      if (response.status === HTTP_CREATED) {
        res.status(response.status).json({
          message: "Reservation created successfully",
          reservation: response.data,
        });
        return;
      }
      res
        .status(response.status)
        .json({ message: "Reservation creation failed" });
    } catch (error: any) {
      res
        .status(error.response?.status || HTTP_INTERNAL_SERVER_ERROR)
        .json(error.response?.data || { message: "An error occurred" });
    }
    return;
  }

  if (req.method === HTTP_PATCH) {
    const { reservationId, newQuantity, reservationState } = req.body;
    const patchData = [
      {
        op: "replace",
        path: "/quantity",
        value: newQuantity,
      },
      {
        op: "replace",
        path: "/reservationState",
        value: reservationState,
      },
    ];
    try {
      const response = await axios.patch(
        `${requestURL}/${reservationId}`,
        patchData,
        appContentHeaders
      );

      if (response.status === HTTP_OK) {
        res.status(response.status).json({
          message: "Reservation updated successfully",
          reservation: response.data,
        });
        return;
      }
      res
        .status(response.status)
        .json({ message: "Reservation update failed" });
    } catch (error: any) {
      res
        .status(error.response?.status || HTTP_INTERNAL_SERVER_ERROR)
        .json(error.response?.data || { message: "An error occurred" });
    }
    return;
  }

  if (req.method === HTTP_PUT) {
    const { reservationId } = req.body;
    queryParams.append("reservationId", String(reservationId));
    try {
      const response = await axios.put(
        `${requestURL}/cancel?${queryParams.toString()}`,
        {},
        appContentHeaders
      );

      if (response.status === HTTP_OK) {
        res.status(response.status).json({
          message: "Reservation updated successfully",
          reservation: response.data,
        });
        return;
      }
      res
        .status(response.status)
        .json({ message: "Reservation update failed" });
    } catch (error: any) {
      res
        .status(error.response?.status || HTTP_INTERNAL_SERVER_ERROR)
        .json(error.response?.data || { message: "An error occurred" });
    }
    return;
  }
}
