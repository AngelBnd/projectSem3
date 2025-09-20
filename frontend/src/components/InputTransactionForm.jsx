import { useState, useEffect } from "react";
import Button from "./Button";
import { useNavigate, useLocation } from "react-router-dom";


export default function InputTransactionForm({ mode, item, isEditMode, formData, setFormData, setProductDetails }) {
  const navigate = useNavigate();


   useEffect(() => {
    if (mode === "edit" && item) {
      setFormData({
        productCode: item.productCode || "",
        invoiceDate: item.invoiceDate || new Date().toISOString().split('T')[0],
        discount: item.discount || "",
        tax: item.tax || "",
        quantitySold: item.quantitySold || ""
      });
    }
  }, [mode, item, setFormData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  useEffect(() => {
    const fetchProductDetails = async (productCode) => {
      // Don't fetch if productCode is empty
      if (!productCode) {
        setProductDetails(null);
        return;
      }
      try {
        const response = await fetch(`http://localhost:3000/api/inventory/${productCode}`);
        if (response.ok) {
          const data = await response.json();
          setProductDetails(data);
        } else {
          setProductDetails(null);
        }
      } catch (error) {
        console.error("Error fetching product details:", error);
        setProductDetails(null);
      }
    };
    
    // Call the function whenever formData.productCode changes
    const debounceTimeout = setTimeout(() => {
      fetchProductDetails(formData.productCode);
    }, 500); // Debounce to prevent fetching on every keystroke
    
    // Cleanup function to clear the timeout
    return () => clearTimeout(debounceTimeout);
    
  }, [formData.productCode]);
  

  const handleSubmit = async (e) => {
    const formData = new FormData(e.target);
    const saleData = Object.fromEntries(formData.entries());

    // Convert numbers properly
    saleData.quantitySold = Number(saleData.quantitySold);
    saleData.discount = Number(saleData.discount);
    saleData.tax = Number(saleData.tax);
    e.preventDefault();

    try {
      const url =
      mode === "edit"
        ? `http://localhost:3000/api/sales/${item.invoiceId}`
        : "http://localhost:3000/api/sales";

        
      const method = mode === "edit" ? "PUT" : "POST";
      const response = await fetch(url, {
        method: method,
        headers: {"Content-Type": "application/json",},
        body: JSON.stringify(saleData),
      });

    if (response.status === 200 || response.status === 204) {
      alert("Inventory item saved!");
      
    } else {
      // Handle server-side errors
      const errorData = await response.json();
      alert(`Failed to save item: ${errorData.error}`);
    }
  } catch (error) {
    console.error("Error:", error);
    alert("An error occurred. Please check the network connection.");
  } 

    window.history.back();
    
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
        placeholder="Product Code"
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
        Invoice date
      </label>
      <div className="relative">
        <input
          type="date"
          name="invoiceDate"
          value={formData.invoiceDate}
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
