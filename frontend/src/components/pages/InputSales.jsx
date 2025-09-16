import { useState } from "react";

export default function InputSales() {
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    amount: "",
    quantity: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const response = await fetch("http://localhost:3000/api/sales", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const result = await response.json();
    console.log("Submitted:", result);

    // Clear form after submit
    setFormData({ id: "", name: "", amount: "", quantity: "" });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto p-6 bg-white shadow-lg rounded-xl space-y-4"
    >
      <h2 className="text-xl font-bold text-black">Add New Sale</h2>

      <div>
        <label className="block text-sm font-medium bold text-black">Product ID</label>
        <input
          type="text"
          name="id"
          value={formData.id}
          onChange={handleChange}
          className="w-full border rounded-lg p-2 mt-1"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium bold text-black">Product Name</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className="w-full border rounded-lg p-2 mt-1"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium bold text-black">Amount ($)</label>
        <input
          type="number"
          name="amount"
          value={formData.amount}
          onChange={handleChange}
          className="w-full border rounded-lg p-2 mt-1"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium bold text-black">Quantity</label>
        <input
          type="number"
          name="quantity"
          value={formData.quantity}
          onChange={handleChange}
          className="w-full border rounded-lg p-2 mt-1"
          required
        />
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
      >
        Submit Sale
      </button>
    </form>
  );
}
