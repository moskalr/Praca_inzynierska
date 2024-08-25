import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import { IconButton } from "@mui/material";
import Image from "next/image";
import React from "react";
import { secondary } from "../../../constants/colors";
import { isFile } from "../../../utils/fileType/isFile";

interface FileInputProps {
  field: {
    onChange: (file: File | undefined) => void;
    value: File | null;
    name: string;
  };
  inputProps: React.InputHTMLAttributes<HTMLInputElement>;
  t: Function;
}

const FileInput: React.FC<FileInputProps> = ({ field, inputProps, t }) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedImage = e.target.files?.[0];
    field.onChange(selectedImage);
  };

  return (
    <>
      <input
        type="file"
        accept="image/*"
        id="image-upload"
        capture="environment"
        style={{ display: "none" }}
        onChange={handleFileChange}
        {...inputProps}
      />
      <div>
        {field.value && isFile(field.value) && (
          <img
            src={URL.createObjectURL(field.value)}
            alt="Selected Image"
            style={{ width: 110, height: 110 }}
          />
        )}
        {field.value && !isFile(field.value) && (
          <Image
            src={field.value as unknown as string}
            alt="Selected Image"
            layout="fixed"
            width={110}
            height={110}
            unoptimized
          />
        )}
      </div>
      <label htmlFor="image-upload">
        <IconButton style={{ color: secondary }} component="span">
          <PhotoCameraIcon />
        </IconButton>
        {t("fridge.actions.image")}
      </label>
    </>
  );
};

export default FileInput;
