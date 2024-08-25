import {
  Button,
  Card,
  CardActions,
  CardContent,
  Typography,
} from "@mui/material";
import Image from "next/image";
import { secondary } from "../../constants/colors";
import styles from "../../styles/product.module.css";
import { ProductList } from "../../type/mzls";
import CategoryDisplay from "../category/CategoryDisplay";

interface ProductCardProps {
  product: ProductList;
  onOpenDetails: (productId: number) => void;
  t: Function;
}

function ProductCard({ product, onOpenDetails, t }: ProductCardProps) {
  return (
    <div className={styles["card-component"]}>
      <Card key={product.id} variant="outlined" className={styles["card"]}>
        <div style={{ display: "flex" }}>
          {product.image !== null && (
            <Image
              src={`${product.image}`}
              alt={product.title}
              layout="fixed"
              width={110}
              height={110}
              unoptimized
            />
          )}
          <CardContent>
            <Typography
              className={styles["card-title"]}
              variant="h6"
              gutterBottom
            >
              {product.title}
            </Typography>
            <CategoryDisplay
              categories={product.categories}
              message={t("product.details.categoryLabel")}
              t={t}
            />
          </CardContent>
        </div>
        <CardActions className={styles["card-actions"]}>
          <Button
            size="small"
            onClick={() => onOpenDetails(product.id)}
            style={{
              color: secondary,
            }}
          >
            {t("product.details.detailsTitle")}
          </Button>
        </CardActions>
      </Card>
    </div>
  );
}

export default ProductCard;
