import dotenv from "dotenv";
import { NextApiRequest, NextApiResponse } from "next";

dotenv.config();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { address } = req.query;
  try {
    const response = await fetch(
      `${process.env.NOMINATIM_GEOCODE_URL}?q=${address}&format=json`
    );
    const data = await response.json();

    if (data && data.length > 0) {
      const result = data[0];
      return res.json({ latitude: result.lat, longitude: result.lon });
    } else {
      return res.json({ message: "Coordinates not found" });
    }
  } catch (error) {
    return res.json({ message: "An error occured" });
  }
}
