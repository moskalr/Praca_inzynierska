import DeleteIcon from "@mui/icons-material/Delete";
import { ButtonBase, Typography } from "@mui/material";
import { useTranslation } from "next-i18next";
import { useState } from "react";
import styles from "~/styles/private_fridge.module.css";
import LoadingState from "../../../utils/loading_spinner/LoadingSpinner";

const dictionary = "private_fridge";

interface Props {
  fridge: PrivateFridgeInfoData;
  patchPrivateFridge(newFridgeData: any): void;
}

function ArchivePrivateFridge({ fridge, patchPrivateFridge }: Props) {
  const { t } = useTranslation(dictionary);
  const [loadingState, setLoadingState] = useState(false);

  const archivePrivateFridge = async () => {
    setLoadingState(true);
    const fridgeNewData = {
      title: fridge.title,
      description: fridge.description,
      archived: !fridge.archived,
    };
    await patchPrivateFridge(fridgeNewData);
    setLoadingState(false);
  };

  return (
    <>
      <LoadingState open={loadingState} />
      <ButtonBase
        component="div"
        onClick={() => archivePrivateFridge()}
        className={styles["achived-fridge-button"]}
      >
        <Typography variant="h6">
          {fridge.archived
            ? t("archive_fridge.restore")
            : t("archive_fridge.archive")}
        </Typography>
        <DeleteIcon />
      </ButtonBase>
    </>
  );
}

export default ArchivePrivateFridge;
