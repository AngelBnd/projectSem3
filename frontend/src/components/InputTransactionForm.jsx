import { useState } from "react";
import Button from "./Button";


export default function InputTransactionForm() {
  const [formData, setFormData] = useState({
    productCode: "",
    productName: "",
    productCategory: "",
    quantitySold: "",
    lastUpdated: "",
    status: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const saleData = Object.fromEntries(formData.entries());

    // Convert numbers properly
    saleData.quantitySold = Number(saleData.quantitySold);
    saleData.discount = Number(saleData.discount);
    saleData.tax = Number(saleData.tax);

    try {
      const res = await fetch("http://localhost:3000/api/sales", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(saleData),
      });

      const result = await res.json();
      if (result.success) {
        alert("Sale saved!");
        e.target.reset();
      } else {
        alert("Failed to save sale: " + result.error);
      }
    } catch (err) {
      console.error("Error submitting sale:", err);
      alert("Something went wrong");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="w-full">
        <label className="block text-sm font-medium text-black font-semibold font-nunito">
          Product Code
        </label>
        <input
          type="text"
          name="productCode"
          placeholder="Product name"
          className="border p-2 rounded-2xl w-full text-black bg-white"
          required
        />
      </div>

      <div className="w-full">
        <label className="block text-sm font-semibold text-black font-nunito mb-1">
          Date
        </label>
        <div className="relative">
          <input
            type="date"
            name="date"
            value={formData.date || new Date().toISOString().split("T")[0]} 
            onChange={handleChange}
            className="border p-2 rounded-2xl w-full text-black bg-white focus:outline-none focus:ring-2 text-gray-400 focus:ring-blue-400 shadow-sm" 
            required
          />
          {/* Calendar SVG overlapped */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 
              00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
      </div>

      <div className="w-full">
        <label className="block text-sm font-medium text-black font-semibold font-nunito">
          Quantity Sold
        </label>
        <input
          type="number"
          name="quantitySold"
          placeholder="Quantity"
          className="border p-2 rounded-2xl w-full text-black bg-white"
          required
        />
      </div>

      <div className="w-full">
        <label className="block text-sm font-medium text-black font-semibold font-nunito">
          Discount
        </label>
        <input
          type="number"
          name="discount"
          placeholder="Discount (%)"
          className="border p-2 rounded-2xl w-full text-black bg-white"
          required
        />
      </div>

      <div className="w-full">
        <label className="block text-sm font-medium text-black font-semibold font-nunito">
          Tax
        </label>
        <input
          type="number"
          name="tax"
          placeholder="Tax (%)"
          className="border p-2 rounded-2xl w-full text-black bg-white"
          required
        />
      </div>

      <div className="flex justify-self-end mt-[32px]">
        <div className="w-[200px] flex gap-2">
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-2xl">
            Save
          </button>
          <div className="underline flex items-center text-[13px] px-3 text-black cursor-pointer">
            Cancel
          </div>
        </div>
      </div>
    </form>

  );
}
