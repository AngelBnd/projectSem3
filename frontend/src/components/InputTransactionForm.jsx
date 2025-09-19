import { useState, useEffect } from "react";
import Button from "./Button";
import { useNavigate } from "react-router-dom";


export default function InputTransactionForm({ mode, item, isEditMode }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    productCode: "",
    productName: "",
    productCategory: "",
    quantitySold: "",
    lastUpdated: "",
    status: "",
  });

   useEffect(() => {
    if (isEditMode && item) {
      setFormData({
        productCode: item.productCode || "",
        productName: item.productName || "",
        productCategory: item.productCategory || "",
        initialStock: item.initialStock || "",
        thresholdStock: item.thresholdStock || "",
        lastUpdated: item.lastUpdated || new Date().toISOString().split('T')[0]
      });
    }
  }, [isEditMode, item]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  

  const handleSubmit = async (e) => {

    const formData = new FormData(e.target);
    const saleData = Object.fromEntries(formData.entries());

    // Convert numbers properly
    saleData.quantitySold = Number(saleData.quantitySold);
    saleData.discount = Number(saleData.discount);
    saleData.tax = Number(saleData.tax);
    e.preventDefault();

    if (isEditMode) {
      // Handle update logic
      console.log("Updating item:", formData);
      // Add your update API call here
    } else {

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
    
    }
    
    
  };
  const handleCancel = () => {
    navigate(-1);
  };

  return (
  <form onSubmit={handleSubmit} className="flex flex-col gap-4">
    <div className="w-full">
      <label className="block text-sm font-medium text-black font-semibold font-nunito mb-1">
        Product Code
      </label>
      <input
        type="text"
        name="productCode"
        value={formData.productCode}
        onChange={handleInputChange}
        className="border p-2 rounded-2xl w-full text-black bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm"
        required
        disabled={isEditMode}
      />
    </div>

    {/* <div className="w-full">
      <label className="block text-sm font-semibold text-black font-nunito mb-1">
        Product Name
      </label>
      <input
        type="text"
        name="productName"
        value={formData.productName}
        onChange={handleInputChange}
        className="border p-2 rounded-2xl w-full text-black bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm"
        required
      />
    </div> */}

    <div className="w-full">
      <label className="block text-sm font-semibold text-black font-nunito mb-1">
        Quantity Sold
      </label>
      <input
        type="number"
        name="quantitySold"
        value={formData.quantitySold}
        onChange={handleInputChange}
        placeholder="Quantity sold"
        className="border p-2 rounded-2xl w-full text-black bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm"
        min="0"
        required
      />
    </div>

    <div className="w-full">
      <label className="block text-sm font-semibold text-black font-nunito mb-1">
        Discount
      </label>
      <input
        type="number"
        name="discount"
        value={formData.discount}
        onChange={handleInputChange}
        placeholder="Discount"
        className="border p-2 rounded-2xl w-full text-black bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm"
        min="0"
        required
      />
    </div>

    <div className="w-full">
      <label className="block text-sm font-semibold text-black font-nunito mb-1">
        Tax
      </label>
      <input
        type="number"
        name="tax"
        value={formData.tax}
        onChange={handleInputChange}
        placeholder="Tax"
        className="border p-2 rounded-2xl w-full text-black bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm"
        min="0"
        required
      />
    </div>

    <div className="w-full">
      <label className="block text-sm font-semibold text-black font-nunito mb-1">
        Last Updated
      </label>
      <div className="relative">
        <input
          type="date"
          name="lastUpdated"
          value={formData.lastUpdated}
          onChange={handleInputChange}
          className="border p-2 rounded-2xl w-full text-black bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm"
          required
          disabled={isEditMode}
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

    <div className="flex justify-self-end mt-[32px]">
      <div className="w-[200px] flex gap-2">
        <Button 
          type="submit" 
          className="bg-blue-500 text-white px-4 py-2 rounded-2xl hover:bg-blue-600 transition-colors"
        >
          {isEditMode ? "Update" : "Save"}
        </Button>
        <div 
          onClick={handleCancel}
          className="underline flex items-center text-[13px] px-3 text-black cursor-pointer hover:text-gray-600 transition-colors"
        >
          Cancel
        </div>
      </div>
    </div>
  </form>

  );
}
