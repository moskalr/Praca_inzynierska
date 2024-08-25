import { TextField } from "@mui/material";

type TextFieldProps = Parameters<typeof TextField>[0];

export const ReservationDeliveryTextField: React.FC<TextFieldProps> = ({
  sx = { m: 1, width: "100%" },
  type = "text",
  InputProps = {
    readOnly: true,
  },
  variant = "outlined",
  size = "small",
  ...restProps
}) => (
  <TextField
    {...restProps}
    type={type}
    variant={variant}
    size={size}
    sx={sx}
    InputProps={InputProps}
  />
);
