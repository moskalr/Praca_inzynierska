import { Accordion, AccordionDetails, Box, Button, Grid } from "@mui/material";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import AccordionSectionHeader from "./AccordionSectionHeader";
import CategoriesSection from "./sections/CategoriesSection";
import LocationSection from "./sections/LocationSection";
import SortSection from "./sections/SortSection";
import EventSection from "./sections/TimeSection";
import { eaaDictionary } from "../../../constants/dictionary";
import { accent } from "../../../constants/colors";

interface ListFilterProps {
  handleUpdateDateSection: (startDate?: string, endDate?: string) => void;
  handleUpdateLocationSection: (city?: string, street?: string) => void;
  handleUpdateStateSection: (state?: string) => void;
  handleUpdateCategorySection: (category?: string) => void;
  handleSortParameters: (sortFilter: string, direction: string) => void;
  resetFilters: () => void;
  handleDrawerOpen: () => void;
  isMobile: boolean;
}

function ListFilter({
  handleUpdateDateSection,
  handleUpdateLocationSection,
  handleUpdateStateSection,
  handleUpdateCategorySection,
  handleSortParameters,
  resetFilters,
  handleDrawerOpen,
  isMobile,
}: ListFilterProps) {
  const { t } = useTranslation(eaaDictionary);
  const [expanded, setExpanded] = useState<string | false>(false);

  const accordionHeaderFontSize = isMobile ? "large" : "medium";
  const accordionHeaderSize = isMobile ? "8vh" : "5vh";

  const handleChange =
    (panel: string) => (event: React.SyntheticEvent, newExpanded: boolean) => {
      if (newExpanded) {
        setExpanded(panel);
      } else {
        setExpanded(false);
      }
    };

  const handleResetButtonClicked = () => {
    resetFilters();
    handleDrawerOpen();
  };

  return (
    <Grid
      container
      direction="column"
      justifyContent="space-between"
      alignItems="center"
      padding="1vh"
    >
      <Box sx={{ width: "98%", marginBottom: "1vh" }}>
        <Accordion
          expanded={expanded === "panel1"}
          onChange={handleChange("panel1")}
          sx={{ width: "100%" }}
        >
          <AccordionSectionHeader
            headerTitle={t("events.filter.product.categories")}
            color={expanded === "panel1" ? accent : "primary.main"}
            headerSize={accordionHeaderSize}
            fontSize={accordionHeaderFontSize}
          />
          <AccordionDetails>
            <CategoriesSection
              updateSectionFilters={handleUpdateCategorySection}
            />
          </AccordionDetails>
        </Accordion>
      </Box>
      <Box sx={{ width: "98%", marginBottom: "1vh" }}>
        <Accordion
          expanded={expanded === "panel2"}
          onChange={handleChange("panel2")}
          sx={{
            width: "100%",
            borderRadius: "20px",
          }}
        >
          <AccordionSectionHeader
            headerTitle={t("events.filter.time.section")}
            color={expanded === "panel2" ? accent : "primary.main"}
            headerSize={accordionHeaderSize}
            fontSize={accordionHeaderFontSize}
          />
          <AccordionDetails>
            <EventSection updateSectionFilters={handleUpdateDateSection} />
          </AccordionDetails>
        </Accordion>
      </Box>
      <Box sx={{ width: "98%", marginBottom: "1vh" }}>
        <Accordion
          expanded={expanded === "panel3"}
          onChange={handleChange("panel3")}
          sx={{ width: "100%" }}
        >
          <AccordionSectionHeader
            headerTitle={t("events.filter.location.section")}
            color={expanded === "panel3" ? accent : "primary.main"}
            headerSize={accordionHeaderSize}
            fontSize={accordionHeaderFontSize}
          />
          <AccordionDetails>
            <LocationSection
              updateSectionFilters={handleUpdateLocationSection}
            />
          </AccordionDetails>
        </Accordion>
      </Box>
      <Box sx={{ width: "98%", marginBottom: "1vh" }}>
        <Accordion
          expanded={expanded === "panel4"}
          onChange={handleChange("panel4")}
          sx={{ width: "100%" }}
        >
          <AccordionSectionHeader
            headerTitle={t("events.sortBy.title")}
            color={expanded === "panel4" ? accent : "primary.main"}
            headerSize={accordionHeaderSize}
            fontSize={accordionHeaderFontSize}
          />
          <AccordionDetails>
            <SortSection handleSortParameters={handleSortParameters} />
          </AccordionDetails>
        </Accordion>
      </Box>
      <Box sx={{ width: "98%", marginBottom: "1vh", marginTop: "1vh" }}>
        <Button
          fullWidth
          variant="contained"
          onClick={handleResetButtonClicked}
          sx={{ backgroundColor: accent }}
        >
          {t("events.filter.reset")}
        </Button>
      </Box>
    </Grid>
  );
}

export default ListFilter;
