function Navbar({ toggleDark }: any) {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 flex justify-between items-center shadow-md">
      
      {/* Left */}
      <h1 className="text-2xl font-bold tracking-wide">
        💸 Expense Tracker
      </h1>

      {/* Right */}
      <div className="flex items-center gap-4">
        <button
          onClick={toggleDark}
          className="text-sm bg-gray-800 text-white px-3 py-1 rounded-md hover:bg-gray-700 transition"
        >
          🌙
        </button>
        <button className="bg-white text-blue-600 px-5 py-2 rounded-lg font-medium hover:bg-gray-100 transition">
          + Add Expense
        </button>

        {/* Profile circle */}
        <div className="w-10 h-10 bg-white text-blue-600 rounded-full flex items-center justify-center font-bold">
          V
        </div>

      </div>
    </div>
  );
}

export default Navbar;