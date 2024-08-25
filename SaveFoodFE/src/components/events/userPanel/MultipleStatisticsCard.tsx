import {
  Card,
  CardContent,
  CardHeader,
  Chip,
  Divider,
  Grid,
  Typography,
} from "@mui/material";
import { get } from "lodash";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { accent } from "../../../constants/colors";
import { eaaDictionary } from "../../../constants/dictionary";
import { productCategories } from "../../../constants/productCategories";
import { CategoryUnitTypes } from "../../../type/mzwo";
import SingleStatisticsCard from "./SingleStatisticsCard";

interface MultipleStatisticsCardProps {
  title: string;
  values: CategoryUnitTypes;
  percentages?: boolean;
}

function MultipleStatisticsCard({
  title,
  values,
  percentages,
}: MultipleStatisticsCardProps) {
  const { t } = useTranslation(eaaDictionary);
  const [currentCategory, setCurrentCategory] = useState<String>("Vegetables");
  const handleChipClicked = (categoryName: string) => {
    setCurrentCategory(categoryName);
  };

  return (
    <Card
      sx={{
        borderRadius: "20px",
        transition: "transform 0.2s",
        "&:hover": {
          transform: "scale(1.02)",
        },
        borderColor: "secondary.main",
        marginBottom: "2vh",
      }}
      variant="outlined"
    >
      <CardHeader subheader={<Typography>{title}</Typography>} />
      <Divider />
      <CardContent sx={{ overflowX: "auto" }}>
        <Grid container spacing={2}>
          {productCategories.map((category, key) => (
            <Grid item key={key}>
              <Chip
                sx={{
                  "&:hover": {
                    transform: "scale(1.02)",
                  },
                  backgroundColor:
                    currentCategory === category.label
                      ? accent
                      : "primary.main",
                }}
                label={t(`category.${category.label.toLowerCase()}`)}
                onClick={() => handleChipClicked(category.label)}
              />
            </Grid>
          ))}
        </Grid>
      </CardContent>
      <CardContent>
        <Grid container spacing={2} justifyContent="center">
          <Grid item xs={2.8}>
            <SingleStatisticsCard
              title={t("userPanel.units.kilograms")}
              value={get(
                values,
                `${currentCategory}.Kilogram`,
                values.Proteins.Kilogram
              )}
              borderStyle="solid"
              borderColor="purple"
              percentages={percentages}
            />
          </Grid>
          <Divider orientation="vertical" />
          <Grid item xs={2.8}>
            <SingleStatisticsCard
              title={t("userPanel.units.liters")}
              value={get(
                values,
                `${currentCategory}.Liter`,
                values.Proteins.Liter
              )}
              borderStyle="dashed"
              borderColor="blue"
              percentages={percentages}
            />
          </Grid>
          <Divider orientation="vertical" />
          <Grid item xs={2.8}>
            <SingleStatisticsCard
              title={t("userPanel.units.packs")}
              value={get(
                values,
                `${currentCategory}.Pack`,
                values.Proteins.Pack
              )}
              borderStyle="double"
              borderColor="green"
              percentages={percentages}
            />
          </Grid>
          <Divider orientation="vertical" />
          <Grid item xs={2.8}>
            <SingleStatisticsCard
              title={t("userPanel.units.items")}
              value={get(
                values,
                `${currentCategory}.Item`,
                values.Proteins.Item
              )}
              borderStyle="dotted"
              borderColor="red"
              percentages={percentages}
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}

export default MultipleStatisticsCard;
