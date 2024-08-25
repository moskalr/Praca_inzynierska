import { Grid, Typography, TypographyVariant } from "@mui/material";

type GridProps = Parameters<typeof Grid>[0];
type TypographyProps = Parameters<typeof Typography>[0];
type GridTextItem = {
  text: string | undefined;
  header?: string;
  gridProps?: GridProps;
  typographyProps?: TypographyProps;
  typographyHeaderProps?: TypographyProps;
};

export const GridTextItem: React.FC<GridTextItem> = ({
  text,
  gridProps,
  typographyProps,
  header,
  typographyHeaderProps,
}) => {
  const combinedGridProps = { xs: 6, sx: { marginTop: 1 }, ...gridProps };
  const combinedTypographyHeaderProps = {
    variant: "buttom" as TypographyVariant,
    ...typographyProps,
  };
  const combinedTypographyProps = {
    variant: "h6" as TypographyVariant,
    ...typographyProps,
  };

  return (
    <Grid item {...combinedGridProps}>
      <Typography {...combinedTypographyHeaderProps}>{header}</Typography>
      <Typography {...combinedTypographyProps}>{text}</Typography>
    </Grid>
  );
};
