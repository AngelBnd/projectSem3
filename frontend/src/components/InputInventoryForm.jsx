import { useState,useEffect } from "react";
import Button from "./Button";
import { useLocation, useNavigate } from "react-router-dom"; 
import { usePopup } from "./PopupContext.jsx";
import { PopupOption, PopupOkay } from "./PopupComp.jsx";

export default function InputInventoryForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { mode, item } = location.state || {};

  const { openPopup } = usePopup();

  const [formData, setFormData] = useState({
    productCode: "",
    productName: "",
    productBrand: "",
    productCategory: "",
    unitCost: "",
    sellingPrice: "",
    initialStock: "",
    thresholdStock: "",
  });

  useEffect(() => {
    if (mode === "edit" && item) {
      setFormData({
        productCode: item.productCode || "",
        productName: item.productName || "",
        productBrand: item.productBrand || "",
        productCategory: item.productCategory || "",
        unitCost: item.unitCost || "",
        sellingPrice: item.sellingPrice || "",
        initialStock: item.initialStock || "",
        thresholdStock: item.thresholdStock || "",

      });
    }
  }, [mode, item]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url =
        mode === "edit"
          ? `http://localhost:3000/api/inventory/${item.productCode}`
          : "http://localhost:3000/api/inventory";

      const method = mode === "edit" ? "PUT" : "POST";


      const token = localStorage.getItem('token');
      if (!token) {
        alert("Authentication token missing. Please log in again.");
        return navigate('/login');
      }

      const headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}` 
      };

      const response = await fetch(url, {
        method: method,
        headers: headers, 
        body: JSON.stringify(formData),
      });

      if (response.status === 200 || response.status === 204|| response.status === 201 ) {
        const resultData = await response.json(); 
        setFormData({
          productCode: "",
          productName: "",
          productBrand: "",
          productCategory: "",
          unitCost: "",
          sellingPrice: "",
          initialStock: "",
          thresholdStock: "",
        });

        // Calls popup with autoclosems -> navigates back after time
        const AUTO_CLOSE_MS = 2500; 

        const navigateBack = () => {
            setTimeout(() => {
                navigate(-1);
            }, 1000); 
        };

        openPopup(
          <PopupOkay message={`Inventory item saved! ${resultData.message || ''}`} />,
          navigateBack(), AUTO_CLOSE_MS);
      } else {
        const errorData = await response.json();
        alert(`Failed to save item: ${errorData.error}`);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred. Please check the network connection.");
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {/* Code + Name */}
      <div className="flex gap-4">
        <div className="w-full">
          <label className="block text-sm font-semibold text-black font-nunito">
            Product Code
          </label>
          <input
            type="text"
            name="productCode"
            value={formData.productCode}
            onChange={handleChange}
            placeholder="Product code"
            className="border p-2 rounded-2xl w-full bg-white text-black"
            required
          />
        </div>

        <div className="w-full">
          <label className="block text-sm font-semibold text-black font-nunito">
            Product Name
          </label>
          <input
            type="text"
            name="productName"
            value={formData.productName}
            onChange={handleChange}
            placeholder="Product name"
            className="border p-2 rounded-2xl w-full bg-white text-black"
            required
          />
        </div>
      </div>

      {/* Brand + Category */}
      <div className="flex gap-4">
        <div className="w-full">
          <label className="block text-sm font-semibold text-black font-nunito">
            Brand
          </label>
          <input
            type="text"
            name="productBrand"
            value={formData.productBrand}
            onChange={handleChange}
            placeholder="Brand"
            className="border p-2 rounded-2xl w-full bg-white text-black"
            required
          />
        </div>

        <div className="w-full">
          <label className="block text-sm font-semibold text-black font-nunito">
            Category
          </label>
          <input
            type="text"
            name="productCategory"
            value={formData.productCategory}
            onChange={handleChange}
            placeholder="Category"
            className="border p-2 rounded-2xl w-full bg-white text-black"
            required
          />
        </div>
      </div>

      {/* Unit Cost + Selling Price */}
      <div className="flex gap-4">
        <div className="w-full">
          <label className="block text-sm font-semibold text-black font-nunito">
            Unit Cost
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 font-medium">
              Rp
            </span>
            <input
              type="number"
              name="unitCost"
              value={formData.unitCost}
              onChange={handleChange}
              placeholder="0"
              className="border p-2 pl-10 rounded-2xl w-full bg-white text-black"
              required
            />
          </div>
        </div>

        <div className="w-full">
          <label className="block text-sm font-semibold text-black font-nunito">
            Selling Price
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 font-medium">
              Rp
            </span>
            <input
              type="number"
              name="sellingPrice"
              value={formData.sellingPrice}
              onChange={handleChange}
              placeholder="0"
              className="border p-2 pl-10 rounded-2xl w-full bg-white text-black"
              required
            />
          </div>
        </div>
      </div>

      {/* Initial Stock + Threshold */}
      <div className="flex gap-4">
        <div className="w-full flex gap-4">
          <div className="w-full">
            <label className="block text-sm font-semibold text-black font-nunito">
              Initial Stock Level
            </label>
            <input
              type="number"
              name="initialStock"
              value={formData.initialStock}
              onChange={handleChange}
              placeholder="Initial Stock Level"
              className="border p-2 rounded-2xl w-full bg-white text-black"
              required
            />
          </div>

          <div className="w-full">
            <label className="block text-sm font-semibold text-black font-nunito">
              Threshold Stock Level
            </label>
            <input
              type="number"
              name="thresholdStock"
              value={formData.thresholdStock}
              onChange={handleChange}
              placeholder="Threshold Stock Level"
              className="border p-2 rounded-2xl w-full bg-white text-black"
              required
            />
          </div>
        </div>
        <div className="w-full"></div>
      </div>

      {/* Buttons */}
      <div className="flex justify-start mt-8">
        <div className="w-[200px] flex gap-2">
          <Button>Save</Button>
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