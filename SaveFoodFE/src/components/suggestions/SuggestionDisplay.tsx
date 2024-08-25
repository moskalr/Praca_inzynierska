import ArchiveIcon from "@mui/icons-material/Archive";
import DeleteIcon from "@mui/icons-material/Delete";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Typography,
} from "@mui/material";
import Image from "next/image";
import { useRouter } from "next/router";
import React, { useState } from "react";
import {
  accordionBackground,
  accordionDisabled,
  secondary,
} from "../../constants/colors";
import { Suggestion } from "../../type/mzls";
import ConfirmationDialog from "../confirm/ConfirmationDialog";

interface SuggestionDisplayProps {
  suggestion: Suggestion;
  handleArchive: (suggestion: Suggestion) => void;
  t: Function;
}

const SuggestionDisplay: React.FC<SuggestionDisplayProps> = ({
  suggestion,
  handleArchive,
  t,
}) => {
  const router = useRouter();
  const [isArchiveConfirmationOpen, setIsArchiveConfirmationOpen] =
    useState(false);
  const { street, buildingNumber, city, postalCode } =
    suggestion.socialFridge.address;

  return (
    <Accordion
      sx={{
        backgroundColor: suggestion.isNew
          ? accordionBackground
          : accordionDisabled,
      }}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography>
          {t("suggestions.messages.address")}
          {`${street} ${buildingNumber}, ${city}, ${postalCode}`}
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Typography>
          {t("suggestions.messages.suggestionContent")} {suggestion.description}
        </Typography>
        {suggestion.image && (
          <Image
            src={`${suggestion.image}`}
            alt={suggestion.description}
            width={110}
            height={110}
            unoptimized
          />
        )}
        <Box display="flex" alignItems="center" mt={1}>
          <Typography>
            {suggestion.isNew
              ? t("suggestions.messages.isNew")
              : t("suggestions.messages.isArchive")}
          </Typography>
          {suggestion.isNew ? (
            <>
              <ArchiveIcon
                color="success"
                onClick={() => setIsArchiveConfirmationOpen(true)}
              />
              <ConfirmationDialog
                isOpen={isArchiveConfirmationOpen}
                onClose={() => setIsArchiveConfirmationOpen(false)}
                onConfirm={() => {
                  handleArchive(suggestion);
                  setIsArchiveConfirmationOpen(false);
                }}
                message={t("suggestions.messages.confirmArchive")}
                t={t}
              />
            </>
          ) : (
            <DeleteIcon />
          )}
        </Box>
        <Box display="flex" alignItems="center" justifyContent="center" mt={1}>
          <Button
            style={{ color: secondary }}
            onClick={() => router.push(`/fridge/${suggestion.socialFridge.id}`)}
          >
            {t("suggestions.messages.goToFridge")}
          </Button>
        </Box>
      </AccordionDetails>
    </Accordion>
  );
};

export default SuggestionDisplay;
