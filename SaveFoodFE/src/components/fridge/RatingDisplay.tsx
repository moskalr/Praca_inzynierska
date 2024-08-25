import { Rating, Stack } from "@mui/material";

interface RatingDisplayProps {
  rating: number;
}

export function RatingDisplay({ rating }: RatingDisplayProps) {
  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      <Stack spacing={1}>
        <Rating
          name="half-rating-read"
          defaultValue={rating}
          precision={0.5}
          readOnly
          size="small"
        />
      </Stack>
    </div>
  );
}

export default RatingDisplay;
