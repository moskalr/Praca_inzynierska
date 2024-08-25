import {
  Bar,
  BarChart,
  CartesianGrid,
  Label,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { statisticsGreen } from "../../constants/colors";

interface CategoriesChartProps {
  t: Function;
  statistics: any;
}

const CategoriesChart = ({ t, statistics }: CategoriesChartProps) => {
  const categoryCounts: Record<string, number> = {};
  statistics?.forEach((fridge: { categoryCounts: any }) => {
    const categories = fridge.categoryCounts;
    for (const category in categories) {
      if (categoryCounts[category]) {
        categoryCounts[category] += categories[category];
      } else {
        categoryCounts[category] = categories[category];
      }
    }
  });

  const data = Object.keys(categoryCounts).map((category) => ({
    category: t(`categories.${category}`),
    count: categoryCounts[category],
  }));

  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart
        width={500}
        height={300}
        data={data}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="category">
          <Label
            value={t(`statistics.category_name`)}
            position="insideBottom"
            dy={7}
          />
        </XAxis>
        <YAxis>
          <Label
            value={t(`statistics.products_count`)}
            position="insideLeft"
            angle={-90}
            dx={-1}
            dy={100}
          />
        </YAxis>
        <Tooltip />
        <Legend />
        <Bar
          dataKey="count"
          fill={statisticsGreen}
          name={t(`statistics.products_count`)}
          barSize={16}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default CategoriesChart;
