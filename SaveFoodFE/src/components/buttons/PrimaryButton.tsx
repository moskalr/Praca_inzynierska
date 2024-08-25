import { Button } from "@mui/material";

const PrimaryButton = (props: {
  [x: string]: any;
  onClick: any;
  width: string;
  color: string;
  hoverColor: string;
  children: React.ReactNode;
}) => {
  const { onClick, width, color, hoverColor, ...inputProps } = props;
  return (
    <Button
      {...{ onClick }}
      fullWidth
      variant="contained"
      sx={{
        width: { width },
        bgcolor: color,
        "&:hover": {
          bgcolor: hoverColor,
        },
      }}
    >
      {props.children}
    </Button>
  );
};

export default PrimaryButton;
