import dotenv from "dotenv";
import { NextApiRequest, NextApiResponse } from "next";

dotenv.config();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { scannedCode } = req.query;
  fetch(`${process.env.OPEN_FOOD_FACTS_URL}${scannedCode}.json`)
    .then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        return Promise.reject("Fetch request failed");
      }
    })
    .then((data) => {
      if (data) {
        res.json(data);
      } else {
        res.json({ message: "Product not found" });
      }
    })
    .catch((error) => {
      res.json({ message: "An error occurred" });
    });
}
