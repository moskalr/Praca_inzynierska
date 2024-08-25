import {
  Divider,
  Grid,
  IconButton,
  TextField,
  Typography,
} from "@mui/material";
import React, { useState } from "react";

import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import { useTranslation } from "react-i18next";
import { eaaDictionary } from "../../../../constants/dictionary";

interface LocationSectionProps {
  updateSectionFilters: (city?: string, street?: string) => void;
}

function LocationSection({ updateSectionFilters }: LocationSectionProps) {
  const [cityInput, setCityInput] = useState("");
  const [streetInput, setStreetInput] = useState("");
  const { t } = useTranslation(eaaDictionary);

  const handleCityBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setCityInput(e.target.value);
  };

  const handleStreetBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setStreetInput(e.target.value);
  };

  const onSubmit = () => {
    updateSectionFilters(cityInput, streetInput);
  };

  return (
    <Grid
      container
      direction="column"
      justifyContent="space-between"
      alignItems="center"
    >
      <Typography sx={{ marginBottom: "0.8vh" }}>
        {t("events.filter.location.text")}
      </Typography>
      <TextField
        variant="outlined"
        placeholder={t("events.filter.location.city")}
        size="small"
        onBlur={handleCityBlur}
        fullWidth
        sx={{ marginTop: "0.8vh", marginBottom: "0.8vh" }}
      />
      <TextField
        variant="outlined"
        placeholder={t("events.filter.location.street")}
        size="small"
        onBlur={handleStreetBlur}
        fullWidth
        sx={{ marginTop: "0.8vh", marginBottom: "0.8vh" }}
      />
      <IconButton onClick={onSubmit}>
        <CheckRoundedIcon />
      </IconButton>
    </Grid>
  );
}

export default LocationSection;
