import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

function MonthlyTrend({ expenses }: any) {
  // group by date
  const dateMap: any = {};

  expenses.forEach((exp: any) => {
    const day = exp.date.slice(0, 10); // yyyy-mm-dd

    dateMap[day] = (dateMap[day] || 0) + exp.amount;
  });

  const data = Object.keys(dateMap).map((date) => ({
    date,
    amount: dateMap[date],
  }));

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl mt-6
        shadow-md hover:shadow-2xl
        transition-all duration-300 ease-out
        hover:-translate-y-1 hover:scale-[1.01]
        border border-transparent hover:border-gray-200 dark:hover:border-gray-700">
      <h2 className="text-lg font-semibold mb-4 dark:text-white">
        📈 Monthly Spending Trend
      </h2>

      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="amount"
            stroke="#4F46E5"
            strokeWidth={3}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default MonthlyTrend;