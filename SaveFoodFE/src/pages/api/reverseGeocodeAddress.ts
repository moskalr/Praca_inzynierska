import dotenv from "dotenv";
import { NextApiRequest, NextApiResponse } from "next";

dotenv.config();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { latitude, longitude } = req.query;
  try {
    const response = await fetch(
      `${process.env.NOMINATIM_REVERSE_GEOCODE_URL}?format=jsonv2&lat=${latitude}&lon=${longitude}`
    );
    const data = await response.json();

    if (data) {
      return res.json({ address: data.address });
    } else {
      return res.json({ message: "Location not found" });
    }
  } catch (error) {
    return res.json({ message: "An error occured" });
  }
}
