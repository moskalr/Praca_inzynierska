import { Button, Rating, Stack } from "@mui/material";
import { useEffect } from "react";
import FridgeData from "../../components/fridge/hooks/FridgeData";
import { secondary } from "../../constants/colors";

interface EditRatingProps {
  fridgeId: number;
  t?: Function;
}
export function EditRating({ t, fridgeId }: EditRatingProps) {
  const { rating, newRating, setNewRating, handleRatingChange } = FridgeData(
    fridgeId,
    t
  );

  useEffect(() => {
    setNewRating(rating);
  }, [rating]);

  const handleRatingValidChange = (
    event: React.ChangeEvent<{}>,
    newValue: number | null
  ) => {
    if (newValue !== null) {
      setNewRating(newValue);
    }
  };

  return (
    <>
      <Stack spacing={1}>
        <Rating
          name="rating"
          defaultValue={newRating}
          value={newRating}
          precision={0.01}
          onChange={handleRatingValidChange}
        />
      </Stack>

      <div>
        <Button
          style={{
            color: newRating === rating ? "#ccc" : secondary,
          }}
          disabled={newRating === rating}
          onClick={() => {
            if (newRating !== rating) {
              handleRatingChange();
            }
          }}
        >
          {t && t("fridge.messages.rate")}
        </Button>
      </div>
    </>
  );
}

export default EditRating;
