import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";

function AddExpense({ setExpenses, editIndex, setEditIndex, editData }: any) {

  const API = import.meta.env.VITE_API_URL;

  const token = localStorage.getItem("token");
 
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
      if (editData) {
        inputRef.current?.focus();
      }
    }, [editData]);

  useEffect(() => {
    if (editData) {
      setTitle(editData.title);
      setAmount(editData.amount);
      setCategory(editData.category);
      setDate(editData.date);
    }
  }, [editData]);

  useEffect(() => {
    if (!editData) {
      setTitle(""); setAmount(""); setCategory(""); setDate("");
    }
  }, [editData]);

 const handleSubmit = async () => {
  if (!title.trim() || !amount.trim() || !category || !date) {
    toast.error("Please fill all fields!");
    return;
  }

  const newExpense = {
    title,
    amount: Number(amount),
    category,
    date,
  };

  if (editIndex !== null) {
    // ✏️ UPDATE
    try {
      await fetch(`https://expense-tracker-backend-h29l.onrender.com/expenses/${editData.id}`, {
        method: 'PUT',
        headers: {
          "Content-Type": `application/json`,Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newExpense),
      });
      toast.success("Expense updated!");
      setEditIndex(null);
      
    } catch (err) {
      toast.error("Something went wrong!");
      return;
    }
    
  } else {
    // ➕ CREATE
    try {
      
      await fetch(`${API}/expenses`, {
        method: `POST`,
        headers: { "Content-Type": `application/json`, Authorization: `Bearer ${token}`,}, 
        body: JSON.stringify(newExpense),
      });
      toast.success("Expense added!");
    } catch (err) {
      toast.error("Something went wrong!");
      return;
    }
  }

  // 🔥 REFRESH
  const res = await fetch(`${API}/expenses`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  const data = await res.json();
  setExpenses(data);

  // clear
  setTitle("");
  setAmount("");
  setCategory("");
  setDate("");
};

  return (
    <div className="max-w-md md:max-w-lg mx-auto mt-10 bg-white dark:bg-gray-800/80 backdrop-blur-md p-6 rounded-xl shadow-md hover:shadow-xl hover:-translate-y-1 transition duration-300">
      <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-400">Add Expense</h2>

      {/* Title Input */}
      <input
        ref={inputRef}
        type="text"
        placeholder="Expense Title"
        className="w-full p-3 rounded-lg mb-3 border 
                  bg-white text-black 
                  dark:bg-gray-700 dark:text-white dark:border-gray-600
                  focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      {/* Amount Input */}
      <input
        type="number"
        placeholder="Amount"
        className="w-full p-3 rounded-lg mb-3 border 
                  bg-white text-black 
                  dark:bg-gray-700 dark:text-white dark:border-gray-600
                  focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <input
        type="date"
        className="w-full p-3 rounded-lg mb-3 border 
        bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600"
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />
      <select
        className="w-full p-3 rounded-lg mb-3 border 
                    bg-white text-black 
                    dark:bg-gray-700 dark:text-white dark:border-gray-600
                  "
        value={category}
        onChange={(e) => setCategory(e.target.value)}
      >
        <option value="">Select Category</option>
        <option value="Food">🍔 Food</option>
        <option value="Travel">✈️ Travel</option>
        <option value="Shopping">🛍️ Shopping</option>
        <option value="Other">📦 Other</option>
      </select>
      {/* Button */}
      <button
        onClick={handleSubmit}
        className="block mx-auto w-full md:w-2/3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white py-2 px-4 rounded-lg mt-4 hover:from-blue-600 hover:to-indigo-600 transition duration-300 hover:scale-105 active:scale-95 transition transform"
      >
        {editIndex !== null ? "Update Expense" : "Add Expense"}
      </button>
    </div>
  );
}

export default AddExpense;