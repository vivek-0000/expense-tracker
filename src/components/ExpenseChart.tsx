

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend  } from "recharts";

const COLORS = ["#4F46E5", "#22C55E", "#F59E0B", "#EF4444"];

function ExpenseChart({ expenses }: any) {
  const categoryData: any = {};

  expenses.forEach((exp: any) => {
    categoryData[exp.category] =
      (categoryData[exp.category] || 0) + exp.amount;
  });

  const data = Object.keys(categoryData).map((key) => ({
    name: key,
    value: categoryData[key],
  }));

  if (data.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow text-center text-gray-500">
        No data to display 📊
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl mt-6
    shadow-md hover:shadow-2xl
    transition-all duration-300 ease-out
    hover:-translate-y-1 hover:scale-[1.01]
    border border-transparent hover:border-gray-200 dark:hover:border-gray-700">
      <h2 className="text-lg font-semibold mb-4 dark:text-white">
        📊 Expense Breakdown
      </h2>
      <p className="text-sm text-gray-500 mb-4">
        Category-wise spending overview
      </p>
      <div className="relative">
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              outerRadius={90}
              label={({ percent }: any) =>
                percent > 0.05 ? `${(percent * 100).toFixed(0)}%` : ""
              }
              paddingAngle={3}
              labelLine={false}
            >
              {data.map((_: any, index: number) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>

            <Tooltip 
              contentStyle={{ borderRadius: "10px", border: "none" }} 
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
        
      </div>
    </div>
  );
}

export default ExpenseChart;