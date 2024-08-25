import { Box } from "@mui/material";
import { useRouter } from "next/router";
import React, { useState } from "react";
import {
  listBackgroundIsActive,
  listBackgroundIsArchive,
  listBackgroundIsInactive,
} from "../../constants/colors";
import { ARCHIVED, INACTIVE } from "../../constants/socialFridgeStates";
import { SocialFridge } from "../../type/mzls";

interface ManagedSocialFridgeProps {
  socialFridge: SocialFridge;
  t: Function;
}

const ManagedSocialFridge: React.FC<ManagedSocialFridgeProps> = ({
  socialFridge,
  t,
}) => {
  const router = useRouter();
  useState(false);
  const { street, buildingNumber, city, postalCode } = socialFridge.address;
  let borderColor = listBackgroundIsActive;

  if (socialFridge.state === ARCHIVED) {
    borderColor = listBackgroundIsArchive;
  } else if (socialFridge.state === INACTIVE) {
    borderColor = listBackgroundIsInactive;
  }

  return (
    <Box sx={{ width: "100%" }}>
      <div
        style={{
          padding: "8px",
          margin: "8px",
          cursor: "pointer",
          borderRadius: "8px",
          border: `2px solid ${borderColor}`,
        }}
        onClick={() => router.push(`/fridge/${socialFridge.id}`)}
      >
        <p>
          {t("managedSocialFridge.messages.address")}
          {`${street} ${buildingNumber}, ${city}, ${postalCode}`}
        </p>
      </div>
    </Box>
  );
};

export default ManagedSocialFridge;
