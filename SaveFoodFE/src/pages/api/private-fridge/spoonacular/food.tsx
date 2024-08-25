import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { scannedCode } = req.query;
  const apiUrl = `${process.env.SPOONACULAR_URL}${scannedCode}?apiKey=${process.env.SPOONACULAR_API_KEY}`;

  try {
    const response = await fetch(apiUrl);

    if (response.ok) {
      const data = await response.json();
      res.json(data);
    } else {
      res.json({ message: "Product not found" });
    }
  } catch (error) {
    res.json({ message: "An error occurred" });
  }
}
