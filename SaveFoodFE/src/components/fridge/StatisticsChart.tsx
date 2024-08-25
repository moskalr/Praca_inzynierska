import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import {
  statisticsGreen,
  statisticsOrange,
  statisticsRed,
} from "../../constants/colors";

interface StatisticsChartProps {
  t: Function;
  statistics: any;
}

const StatisticsChart = ({ t, statistics }: StatisticsChartProps) => {
  const totalArchivedByUserCount = statistics?.reduce(
    (sum: any, socialFridge: { archivedByUserCount: any }) =>
      sum + socialFridge.archivedByUserCount,
    0
  );

  const totalArchivedBySystemCount = statistics?.reduce(
    (sum: any, socialFridge: { archivedBySystemCount: any }) =>
      sum + socialFridge.archivedBySystemCount,
    0
  );

  let totalProducts = statistics?.reduce(
    (sum: any, socialFridge: { donatedFoodCount: any }) =>
      sum + socialFridge.donatedFoodCount,
    0
  );
  const totalAvailabeProducts =
    totalProducts - totalArchivedByUserCount - totalArchivedBySystemCount;

  const data = [
    {
      name: t("statistics.saved_food_percentage"),
      value: parseFloat(
        ((totalArchivedByUserCount / totalProducts) * 100).toPrecision(4)
      ),
      color: statisticsGreen,
    },
    {
      name: t("statistics.waste_food_percentage"),
      value: parseFloat(
        ((totalArchivedBySystemCount / totalProducts) * 100).toPrecision(4)
      ),
      color: statisticsRed,
    },
    {
      name: t("statistics.available_food_percentage"),
      value: parseFloat(
        ((totalAvailabeProducts / totalProducts) * 100).toPrecision(4)
      ),
      color: statisticsOrange,
    },
  ];

  return (
    <ResponsiveContainer width="100%" height={400}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          outerRadius={100}
          label={({ name, percent }) =>
            `${name}: ${(percent * 100).toFixed(2)}%`
          }
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default StatisticsChart;
