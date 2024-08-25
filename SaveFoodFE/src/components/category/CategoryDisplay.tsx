import Typography from "@mui/material/Typography";

interface CategoryDisplayProps {
  categories: string[];
  message: string;
  t: Function;
}

function CategoryDisplay({ categories, message, t }: CategoryDisplayProps) {
  return (
    <Typography variant="body2">
      {message}:
      {categories.map((category, index) => (
        <span key={category}>
          {t(`categories.${category}`, {
            defaultValue: category,
          })}
          {index < categories.length - 1 ? ", " : ""}
        </span>
      ))}
    </Typography>
  );
}

export default CategoryDisplay;
