import { Box, Typography } from "@mui/material";

interface TabPanelProps {
  children?: React.ReactNode;
  value: number;
  index: number;
}

export function TabPanel({ children, value, index }: TabPanelProps) {
  return (
    <Typography
      component="div"
      role="tabpanel"
      hidden={value !== index}
      id={`event-details-tabpanel-${index}`}
      aria-labelledby={`event-details-tab-${index}`}
    >
      {value === index && <Box>{children}</Box>}
    </Typography>
  );
}

export default TabPanel;
