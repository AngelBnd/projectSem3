import { useState } from "react";

export default function InputInventory() {
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    category: "",
    quantity: "",
    lastUpdated: "",
    status: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:3000/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        alert("Inventory item saved!");
        setFormData({
          code: "",
          name: "",
          category: "",
          quantity: "",
          lastUpdated: "",
          status: "",
        });
      } else {
        alert("Failed to save item.");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 flex flex-col gap-3">
      <input
        type="text"
        name="code"
        value={formData.code}
        onChange={handleChange}
        placeholder="Code"
        className="border p-2 rounded"
        required
      />
      <input
        type="text"
        name="name"
        value={formData.name}
        onChange={handleChange}
        placeholder="Name"
        className="border p-2 rounded"
        required
      />
      <input
        type="text"
        name="category"
        value={formData.category}
        onChange={handleChange}
        placeholder="Category"
        className="border p-2 rounded"
        required
      />
      <input
        type="number"
        name="quantity"
        value={formData.quantity}
        onChange={handleChange}
        placeholder="Quantity"
        className="border p-2 rounded"
        required
      />
      <input
        type="date"
        name="lastUpdated"
        value={formData.lastUpdated}
        onChange={handleChange}
        className="border p-2 rounded"
        required
      />
      <select
        name="status"
        value={formData.status}
        onChange={handleChange}
        className="border p-2 rounded"
        required
      >
        <option value="">Select Status</option>
        <option value="Available">Available</option>
        <option value="Low Stock">Low Stock</option>
        <option value="Out of Stock">Out of Stock</option>
      </select>
      <button type="submit" className="bg-green-500 text-white p-2 rounded">
        Save Item
      </button>
    </form>
  );
}
