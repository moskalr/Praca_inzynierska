import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import { NextApiRequest, NextApiResponse } from "next";

interface MulterNextApiRequest extends NextApiRequest {
  file: any;
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const upload = multer({ dest: "uploads/" });

export const config = {
  api: {
    bodyParser: false,
  },
};

const handler = async (req: MulterNextApiRequest, res: NextApiResponse) => {
  upload.single("image")(req as any, res as any, (err: any) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "An error occurred during file upload" });
    }

    const filePath = req.file.path;

    cloudinary.uploader.upload(
      filePath,
      (error: any, result: { secure_url: any }) => {
        if (error) {
          return res.status(500).json({
            message: "An error occurred during image upload to Cloudinary",
          });
        }

        res.json({ imageUrl: result.secure_url });
      }
    );
  });
};

export default handler;
