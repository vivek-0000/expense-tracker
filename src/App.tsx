import { useState } from "react";
import { useEffect } from "react";
import { useRef } from "react";
import { motion } from "framer-motion";
import Navbar from "./components/Navbar";
import AddExpense from "./components/AddExpense";
import ExpenseChart from "./components/ExpenseChart";
import { Toaster } from "react-hot-toast";
import toast from "react-hot-toast";
import MonthlyTrend from "./components/MonthlyTrend";
import Login from "./components/Login";



function App() {
  
  const token = localStorage.getItem("token");

  if (!token) {
    return <Login />;
  }
  const [expenses, setExpenses] = useState<any[]>([]);

  const API = import.meta.env.VITE_API_URL;


  useEffect(() => {
    fetch(`${API}/expenses`, {
      headers: {
        Authorization: `Bearer ${token}`,  // ✅ ADD
      },
    })
      .then((res) => res.json())
      .then((data) => setExpenses(data));
  }, [API]);

  const [filter, setFilter] = useState("");

  const [dark, setDark] = useState(false);

  const [search, setSearch] = useState("");

  const [budget, setBudget] = useState<number | "">(0);

  const currentMonthKey = new Date().toISOString().slice(0, 7); // "2026-03"

 useEffect(() => {
    fetch(`${API}/budget/${currentMonthKey}`, {
      headers: {
        Authorization: `Bearer ${token}`,  // ✅ ADD
      },
    })
      .then((res) => res.json())
      .then((data) => setBudget(data.amount));
  }, [API]);

  const saveBudget = async () => {
    try {
      await fetch(`${API}/budget`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        month: currentMonthKey,
        amount: Number(budget),
      }),
    });
    
    toast.success("Budget saved!");
  } catch {
    toast.error("Failed to save budget");
  }
  
};

  const [isEditingBudget, setIsEditingBudget] = useState(false);

  const totalExpenses = expenses.reduce(
    (sum, exp) => sum + exp.amount,
    0
  );
  const remaining = typeof budget === "number" ? budget - totalExpenses : 0;

  const categoryTotals: any = {};
    expenses.forEach((e) => {
      categoryTotals[e.category] =
        (categoryTotals[e.category] || 0) + e.amount;
    });

    const topCategory = Object.keys(categoryTotals).reduce(
      (a, b) =>
        categoryTotals[a] > categoryTotals[b] ? a : b,
      Object.keys(categoryTotals)[0]
    );

    let topCategoryPercent = 0;

      if (totalExpenses > 0 && topCategory) {
        topCategoryPercent = Math.round(
          (categoryTotals[topCategory] / totalExpenses) * 100
        );
      }

    let recommendation = "";

      if (topCategoryPercent > 50) {
        recommendation = `💡 You spend a lot on ${topCategory}. Try reducing it.`;
      }

    let weekendTotal = 0;
    let weekdayTotal = 0;

    expenses.forEach((e) => {
      const day = new Date(e.date).getDay();

      if (day === 0 || day === 6) {
        weekendTotal += e.amount;
      } else {
        weekdayTotal += e.amount;
      }
    });
    
  const avgExpense =expenses.length > 0? Math.round(totalExpenses / expenses.length): 0;

  const [fileName, setFileName] = useState("");

  const handleImport = (e: any) => {
  const file = e.target.files[0];
  if (!file) return;

  setFileName(file.name);

  const reader = new FileReader();

  reader.onload = async (event: any) => {
    const text = event.target.result;

    const rows = text.split("\n").slice(1);

    const newExpenses = rows
    .map((row: string) => {
      const [title, amount, category, date] = row.split(",");

      if (!title) return null;

      return {
        title,
        amount: Number(amount),
        category,
        date,
      };
    })
    .filter(Boolean);


    
    // 🔥 FAST PARALLEL API CALLS
    await Promise.all(
      newExpenses.map((exp: any) =>
        fetch(`${API}/expenses`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(exp),
        })
      )
    );

    // 🔥 REFRESH
    const res = await fetch(`${API}/expenses`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    const data = await res.json();
    setExpenses(data);
  };

  reader.readAsText(file);
};

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete?")) return;

    try {
      const res = await fetch(`${API}/expenses/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,   // ✅ ADD
        },
      });

      if (!res.ok) throw new Error("Delete failed");

      toast.success("Deleted successfully!");

      // refresh
      const res2 = await fetch(`${API}/expenses`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res2.json();
      setExpenses(data);

    } catch (err) {
      toast.error("Failed to delete");
    }
  };

  const fileInputRef = useRef<HTMLInputElement | null>(null);

 

  

  


  
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const monthlyTotal = expenses
    .filter((exp) => {
      const d = new Date(exp.date);
      return (
        d.getMonth() === currentMonth &&
        d.getFullYear() === currentYear
      );
    })
    .reduce((sum, exp) => sum + exp.amount, 0);

  const lastMonth = new Date().getMonth() - 1;
  const lastMonthYear =
     lastMonth < 0 ? currentYear - 1 : currentYear;
   const adjustedlastMonth = lastMonth < 0 ? 11 : lastMonth;

   const lastMonthTotal = expenses
      .filter((exp) => {
        const d = new Date(exp.date);
        return (
          d.getMonth() === adjustedlastMonth &&
          d.getFullYear() === lastMonthYear
        );
      })
      .reduce((sum, exp) => sum + exp.amount, 0);

  const percentChange =
  lastMonthTotal === 0
    ? 0
    : Math.round(
        ((monthlyTotal - lastMonthTotal) / lastMonthTotal) * 100
      );

  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editData, setEditData] = useState<any>(null);
  const formRef = useRef<HTMLDivElement | null>(null);
  const exportCSV = () => {
    const headers = ["Title", "Amount", "Category", "Date"];

    const rows = expenses.map((e) => [
      e.title,
      e.amount,
      e.category,
      e.date,
    ]);

    const csvContent =
      [headers, ...rows].map((row) => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "expenses.csv";
    a.click();

};
  



  return (
    <>
    <Toaster position="top-right" />
    <div
      className={`${
        dark ? "dark bg-gray-900" : "bg-gray-100"
      } min-h-screen flex flex-col`}
    >

      <Navbar toggleDark={() => setDark(!dark)} />
      <div className="px-4 md:px-0">
        <div className=" flex-grow p-6">
              <h2 className="text-3xl font-semibold text-gray-800 dark:text-white">
                Welcome 👋
              </h2>
              <p className="text-gray-500 dark:text-gray-300 mt-2">
                Track your expenses easily and stay on budget.
              </p>
        </div>  
        <div className="flex-grow">
          <div className="max-w-5xl mx-auto px-4">
            
            <div ref={formRef}>
              {/* Add Expense Form */}
              <AddExpense
                setExpenses={setExpenses}
                editIndex={editIndex}
                setEditIndex={setEditIndex}
                editData={editData}
              />
            </div>

            <div className="flex justify-center mt-6 gap-2 items-center">

              {isEditingBudget ? (
                <input
                  type="number"
                  placeholder="Set Monthly Budget"
                  className="p-2 rounded border 
                  bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600"
                  value={budget === "" ? "" : budget}
                  onChange={(e) => {
                    const value = e.target.value;
                    setBudget(value === "" ? "" : Number(value));
                  }}
                />
              ) : (
                <p className="text-lg font-semibold dark:text-white">
                  Budget: ₹{budget || 0}
                </p>
              )}

              <button
                onClick={async () => {
                  if (isEditingBudget) {
                    // 🔥 SAVE TO BACKEND
                    await saveBudget();
                  }

                  setIsEditingBudget(!isEditingBudget);
                }}
                className="text-blue-500 hover:text-blue-700"
              >
                {isEditingBudget ? "Save" : "Edit"}
              </button>

            </div>

            <div className="max-w-3xl mx-auto mt-6 px-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        
              {/* Total Expenses */}
              <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }} 
              className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md p-5 rounded-xl shadow hover:shadow-xl hover:-translate-y-1 transition duration-300">
                <h3 className="text-gray-500 dark:text-gray-400 text-sm">Total Expenses</h3>
                <p className="text-2xl font-bold text-blue-600 mt-2">
                  ₹{expenses.reduce((sum, exp) => sum + exp.amount, 0)}
                </p>
              </motion.div>

              {/* Total Transactions */}
              <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md p-5 rounded-xl shadow hover:shadow-xl hover:-translate-y-1 transition duration-300">
                <h3 className="text-gray-500 dark:text-gray-400 text-sm">Transactions</h3>
                <p className="text-2xl font-bold text-green-600 mt-2">
                  {expenses.length}
                </p>
              </motion.div>

              {/* Monthly Transactions */}
              <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md p-5 rounded-xl shadow hover:shadow-xl hover:-translate-y-1 transition duration-300">
                <h3 className="text-gray-500 dark:text-gray-400 text-sm">
                  This Month
                </h3>
                <p className="text-2xl font-bold text-purple-600 mt-2">
                  ₹{monthlyTotal}
                </p>
                <p
                  className={`text-sm mt-1 ${
                    percentChange >= 0
                      ? "text-green-500"
                      : "text-red-500"
                  }`}
                >
                  {percentChange >= 0 ? "↑" : "↓"}{" "}
                  {Math.abs(percentChange).toFixed(1)}% from last month
                </p>
              </motion.div>

              <motion.div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md p-5 rounded-xl shadow hover:shadow-xl hover:-translate-y-1 transition duration-300">
                <h3 className="text-gray-500 dark:text-gray-400 text-sm">
                  Remaining Budget
                </h3>
                <p
                  className={`text-2xl font-bold mt-2 ${
                    remaining < 0 ? "text-red-500" : "text-green-500"
                  }`}
                >
                  ₹{remaining}
                </p>
              </motion.div>

            </div>

            {remaining < 0 && (
              <p className="text-center text-red-500 mt-4">
                ⚠️ Budget exceeded!
              </p>
            )}

            <div className="max-w-md mx-auto mt-6 bg-white dark:bg-gray-800 p-4 rounded-xl shadow hover:shadow-xl hover:-translate-y-1 transition duration-300">
              <h3 className="text-lg font-semibold mb-2 dark:text-white">
                Insights
              </h3>

              <p className="text-gray-600 dark:text-gray-300">
                🏆 Top Category: {topCategory || "N/A"}
              </p>

              <p className="text-gray-600 dark:text-gray-300">
                📊 Avg Expense: ₹{avgExpense}
              </p>

              <p className="text-gray-600 dark:text-gray-300 ">
                📅 Weekend: ₹{weekendTotal} | Weekday: ₹{weekdayTotal}
              </p>

            </div>

            <div className="max-w-md mx-auto mt-6 space-y-2">

              {percentChange > 20 && (
                <p className="text-yellow-500 text-center">
                  ⚠️ You spent {percentChange}% more than last month
                </p>
              )}

              {percentChange < -20 && (
                <p className="text-green-500 text-center">
                  🎉 You reduced spending by {Math.abs(percentChange)}%
                </p>
              )}

              {topCategoryPercent > 50 && (
                <p className="text-blue-500 text-center">
                  💡 {topCategory} is {topCategoryPercent}% of your expenses
                </p>
              )}

            </div>
            {recommendation && (
              <p className="text-purple-500 text-center mt-2">
                {recommendation}
              </p>
            )}

            <ExpenseChart expenses={expenses} />
            <MonthlyTrend expenses={expenses} />
            <div className="max-w-md mx-auto mt-6 bg-white/70 dark:bg-gray-800/70 backdrop-blur-md p-4 rounded-lg shadow hover:shadow-xl hover:-translate-y-1 transition duration-300">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-400">
                Total: ₹
                {expenses.reduce((sum, exp) => sum + exp.amount, 0)}
              </h3>
            </div>

            <div className="flex justify-center gap-4 mt-6 flex-wrap">
              <button
                onClick={exportCSV}
                className="bg-green-500 hover:bg-green-600 text-white px-5 py-2 rounded-lg shadow transition hover:scale-105 active:scale-95 transition transform"
              >
                Export CSV
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="bg-purple-500 hover:bg-purple-600 text-white px-5 py-2 rounded-lg shadow transition hover:scale-105"
              >
                Import CSV
              </button>

            </div>

            <div className="flex justify-center mt-4">
              <input
                type="file"
                accept=".csv"
                ref={fileInputRef}
                onChange={handleImport}
                className="hidden"
              />
            </div>

            {fileName && (
              <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-2">
                {fileName} ✅
              </p>
            )}

            <div className="max-w-md mx-auto mt-6 bg-white/70 dark:bg-gray-800/70 backdrop-blur-md p-4 rounded-xl shadow">

              <input
                type="text"
                placeholder="Search expenses..."
                className="w-full p-2 border rounded mb-3 
                bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              <div className="flex justify-center gap-2 flex-wrap">
                {["All", "Food", "Travel", "Shopping", "Other"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setFilter(cat === "All" ? "" : cat)}
                    className={`px-3 py-1 rounded-full transition ${
                      (filter === cat || (cat === "All" && filter === ""))
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

            </div>

            {/* Expense List */}
            <div className="max-w-md md:max-w-2xl mx-auto mt-6 px-4">
              {expenses.length === 0 ? (
                <p className="text-center text-gray-500"> No expenses yet. Start tracking 💸</p>
                ) : (
                expenses.filter((exp) =>(!filter || exp.category === filter) && exp.title.toLowerCase().includes(search.toLowerCase())).map((exp, index) => (
                  <motion.div
                    key={exp.id || index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md p-4 mb-3 rounded-lg shadow 
                                flex justify-between items-center 
                                hover:shadow-xl hover:-translate-y-1 transition duration-300"
                  >
                    <div>
                      <p className="font-medium text-gray-800 dark:text-white">{exp.title}</p>

                      <p className="text-xs text-gray-500 dark:text-gray-400">{exp.date}</p>

                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          exp.category === "Food"
                            ? "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300"
                            : exp.category === "Travel"
                            ? "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300"
                            : exp.category === "Shopping"
                            ? "bg-pink-100 text-pink-600 dark:bg-pink-900 dark:text-pink-300"
                            : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                        }`}
                      >
                        {exp.category}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-semibold text-gray-700 dark:text-gray-300">₹{exp.amount}</span>

                      {/* DELETE BUTTON */}
                      <button
                        onClick={() => handleDelete(exp.id)}
                        className="text-red-500 hover:text-red-700 font-bold text-lg"
                      >
                        ✕
                      </button>
                      <button
                        onClick={() => {
                          setEditIndex(index);
                          setEditData(exp);

                          formRef.current?.scrollIntoView({
                            behavior: "smooth",
                          });

                        }}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        ✏️
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
              {expenses.filter(
                  (exp) =>
                    (!filter || exp.category === filter) &&
                    exp.title.toLowerCase().includes(search.toLowerCase())
                ).length === 0 &&
                  (search || filter) && (
                    <p className="text-center text-gray-500 mt-6">
                      No expenses matching found.
                    </p>
                )}
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}

export default App;