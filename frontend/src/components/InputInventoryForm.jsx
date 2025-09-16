import { useState } from "react";
import Button from "./Button";
import { Link } from "react-router-dom";

export default function InputInventoryForm() {
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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:3000/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        alert("Inventory item saved!");
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
      } else {
        alert("Failed to save item. a");
      }
    } catch (error) {
      console.error("Error:", error);
    }
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
            value={formData.code}
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
            value={formData.name}
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
            value={formData.brand}
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
            value={formData.category}
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
              value={formData.unit_cost}
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
              value={formData.selling_price}
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
                value={formData.initial_stock}
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
                value={formData.threshold_stock}
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
          <Link to="/inventory" className="flex items-center">
            <div className="underline text-[13px] px-3 text-black cursor-pointer">
              Cancel
            </div>
          </Link>
        </div>
      </div>
    </form>
  );
}
