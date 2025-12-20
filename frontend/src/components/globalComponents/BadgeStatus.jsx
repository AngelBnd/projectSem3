import React from "react";

const STATUS_STYLES = {
  // Products
  ACTIVE: { bg: "bg-green-100", text: "text-green-700" },
  INACTIVE: { bg: "bg-gray-100", text: "text-gray-700" },
  "Low Stock": { bg: "bg-yellow-100", text: "text-yellow-700" },
  "Out of Stock": { bg: "bg-red-100", text: "text-red-700" },

  // Orders
  DELIVERED: { bg: "bg-green-100", text: "text-green-700" },
  PARTIALLY_DELIVERED: { bg: "bg-yellow-100", text: "text-yellow-700" },
  UNDELIVERED: { bg: "bg-red-100", text: "text-red-700" },

  PAID: { bg: "bg-blue-100", text: "text-blue-700" },
  PARTIALLY_PAID: { bg: "bg-indigo-100", text: "text-indigo-700" },
  UNPAID: { bg: "bg-gray-100", text: "text-gray-700" },
  // Audit Logs
  "Pending Review": { bg: "bg-orange-100", text: "text-orange-700" },

  // Audit per Product
  Damaged: { bg: "bg-red-100", text: "text-red-700" },
  Miscount: { bg: "bg-amber-100", text: "text-amber-700" },
  "Supplier Error": { bg: "bg-purple-100", text: "text-purple-700" },
  "Unrecorded Sale": { bg: "bg-blue-100", text: "text-blue-700" },
  "Unrecorded Receipt": { bg: "bg-pink-100", text: "text-pink-700" },

  // Inventory Movement
  "Purchase Order": { bg: "bg-teal-100", text: "text-teal-700" },
  "Audit Log": { bg: "bg-slate-100", text: "text-slate-700" },
};

const Badge = ({ status }) => {
  const style = STATUS_STYLES[status] || {
    bg: "bg-gray-100",
    text: "text-gray-700",
  };

  return (
    <span
      className={`flex items-center px-3 py-1 rounded-full font-medium text-xs ${style.bg} ${style.text}`}
    >
      {status}
    </span>
  );
};

export default Badge;
