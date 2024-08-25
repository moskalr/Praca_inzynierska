import FmdGoodRoundedIcon from "@mui/icons-material/FmdGoodRounded";
import {
  Box,
  Dialog,
  DialogContent,
  IconButton,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import dynamic from "next/dynamic";
import React from "react";
import styles from "~/styles/managed_social_fridge.module.css";
import { LatLng } from "../../type/mzls";
import { handleMapChoiceAndSetAddress } from "../../utils/address/findAddress";

interface MapDialogProps {
  isOpen: boolean;
  onClose: () => void;
  userLocation?: LatLng;
  latitude: number | null;
  longitude: number | null;
  setValue: Function;
  handleMapOpened: () => void;
  buttonLabel?: string;
}

const MapDialog: React.FC<MapDialogProps> = ({
  isOpen,
  onClose,
  userLocation,
  latitude,
  longitude,
  setValue,
  handleMapOpened,
  buttonLabel,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const DynamicMap = dynamic(() => import("../../components/map/Map"), {
    ssr: false,
  });
  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      keepMounted
      scroll="paper"
      sx={{
        "& .MuiDialog-container": {
          "& .MuiPaper-root": {
            width: "100%",
            height: "100%",
            maxWidth: !isMobile ? "50%" : "100%",
          },
        },
      }}
    >
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        sx={{
          top: "50%",
        }}
      >
        <DialogContent>
          <div className={styles["stepper-map"]}>
            <DynamicMap
              userLocation={userLocation}
              specificLatitude={latitude}
              specificLongitude={longitude}
              addressIconUrl="/icons/fridge.png"
              handleSubmitMapChoice={(mapCenterCoordinates) =>
                handleMapChoiceAndSetAddress(mapCenterCoordinates, setValue)
              }
              handleMapOpened={handleMapOpened}
              isSubmitButtonVisible={true}
              buttonLabel={buttonLabel}
            />
          </div>
          <IconButton
            style={{
              position: "absolute",
              top: "47%",
              left: "51%",
              transform: "translate(-50%, -50%)",
              zIndex: 1,
            }}
          >
            <FmdGoodRoundedIcon />
          </IconButton>
        </DialogContent>
      </Box>
    </Dialog>
  );
};

export default MapDialog;
