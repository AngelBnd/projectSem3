import { useState,useEffect } from "react";
import type { ChangeEvent, FormEvent } from "react";
import Button from "../../../components/globalComponents/Button";
import { createInventoryItem, updateInventoryItem } from "../api";
import { useLocation, useNavigate } from "react-router-dom"; 
import { usePopup } from "../../../components/globalComponents/PopupContext";
import { PopupOkay } from "../../../components/globalComponents/PopupComp";
import { getErrorMessage } from "../../../lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function InputInventoryForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { mode, item } = location.state || {};

  const { openPopup } = usePopup();
  const queryClient = useQueryClient();

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
  const saveInventoryMutation = useMutation({
    mutationFn: ({
      productCode,
      submitData,
    }: {
      productCode?: string;
      submitData: typeof formData | (typeof formData & { stockToAdd: number });
    }) => {
      if (mode === "edit") {
        if (!productCode) {
          throw new Error("Product code is required to update an inventory item.");
        }
        return updateInventoryItem(productCode, submitData);
      }
      return createInventoryItem(submitData);
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["inventory"] }),
        queryClient.invalidateQueries({ queryKey: ["dashboard"] }),
      ]);
    },
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
        initialStock: "", // Empty in edit mode - represents stock to add
        thresholdStock: item.thresholdStock || "",
      });
    }
  }, [mode, item]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert("Authentication token missing. Please log in again.");
        return navigate('/login');
      }

      // For edit mode, we only want to send the stock addition, not replace the entire stock
      const submitData = mode === "edit" 
        ? { ...formData, stockToAdd: parseInt(formData.initialStock) || 0 }
        : formData;

      const resultData = await saveInventoryMutation.mutateAsync({
        productCode: item?.productCode,
        submitData,
      });

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

      navigateBack();
      openPopup(
        <PopupOkay message={`Inventory item ${mode === 'edit' ? 'updated' : 'saved'}! ${resultData.message || ''}`} />,
        null, AUTO_CLOSE_MS);
    } catch (error) {
      console.error("Error:", error);
      alert(`Failed to save item: ${getErrorMessage(error)}`);
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
            disabled={mode === "edit"} // Disable editing product code in edit mode
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

      {/* Stock Fields */}
      <div className="flex gap-4">
        <div className="w-full flex gap-4">
          <div className="w-full">
            <label className="block text-sm font-semibold text-black font-nunito">
              {mode === "edit" ? "Stock to Add" : "Initial Stock Level"}
            </label>
            <input
              type="number"
              name="initialStock"
              value={formData.initialStock}
              onChange={handleChange}
              placeholder={mode === "edit" ? "Quantity to add" : "Initial Stock Level"}
              className="border p-2 rounded-2xl w-full bg-white text-black"
              required={mode !== "edit"} // Not required in edit mode (can be 0)
              min="0"
            />
            {mode === "edit" && (
              <p className="text-xs text-gray-500 mt-1">
                Enter the quantity you want to add to current stock
              </p>
            )}
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
          <Button>{mode === "edit" ? "Update" : "Save"}</Button>
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