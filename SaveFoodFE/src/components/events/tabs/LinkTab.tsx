import { Tab } from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";

interface LinkTabProps {
    label?: string;
    href?: string;
  }
  
function LinkTab(props: LinkTabProps) {
    return <Tab icon={<ArrowBackRoundedIcon />} component="a" {...props} />;
}

export default LinkTab;