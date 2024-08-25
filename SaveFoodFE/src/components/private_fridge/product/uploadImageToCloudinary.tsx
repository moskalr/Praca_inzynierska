const axios = require("axios");

const uploadImageToCloudinary = async (image: File | any) => {
  try {
    const formData = new FormData();
    formData.append("file", image);
    formData.append("upload_preset", "uphkvlak");

    const response = await axios.post(
      `https://api.cloudinary.com/v1_1/dyzi6glni/image/upload`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  } catch (error) {
    throw error;
  }
};

export default uploadImageToCloudinary;
