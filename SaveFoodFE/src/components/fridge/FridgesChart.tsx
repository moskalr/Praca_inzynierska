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
import { statisticsGreen, statisticsOrange } from "../../constants/colors";

interface FridgeChartProps {
  t: Function;
  statistics: any;
}

const FridgeChart = ({ t, statistics }: FridgeChartProps) => {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart
        width={500}
        height={300}
        data={statistics}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="id"
          tickFormatter={(id) => {
            const fridge = statistics.find(
              (item: { id: any }) => item.id === id
            );
            if (fridge) {
              return `${fridge.address.street}, ${fridge.address.buildingNumber}, ${fridge.address.city}`;
            }
            return "";
          }}
        >
          <Label
            value={t("statistics.fridge_address")}
            position="insideBottom"
            dy={7}
          />
        </XAxis>

        <YAxis>
          <Label
            value={t("statistics.products_count")}
            position="insideLeft"
            angle={-90}
            dx={-1}
            dy={100}
          />
        </YAxis>
        <Tooltip />
        <Legend />
        <Bar
          dataKey="donatedFoodCount"
          fill={statisticsOrange}
          name={t("preferences.details.donatedFood")}
          barSize={16}
        />
        <Bar
          dataKey="archivedByUserCount"
          fill={statisticsGreen}
          name={t("preferences.details.savedFood")}
          barSize={16}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default FridgeChart;
