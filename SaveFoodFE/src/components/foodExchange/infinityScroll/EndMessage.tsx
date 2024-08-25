import { Divider, Typography } from "@mui/material";

interface EndMessageProps {
  noItems: boolean;
  loading: boolean;
  noMoreProducts: string;
  noItemsMessage: string;
}

export default function EndMessage({
  loading,
  noMoreProducts,
  noItems,
  noItemsMessage,
}: EndMessageProps) {
  return (
    <>
      {!loading && (
        <>
          <Typography variant="h5" sx={{ textAlign: "center", m: 1 }}>
            {noItems ? noItemsMessage : noMoreProducts}
          </Typography>
          <Divider orientation="horizontal" />
        </>
      )}
    </>
  );
}
