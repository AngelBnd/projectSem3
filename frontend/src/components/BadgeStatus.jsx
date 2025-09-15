// Badge.jsx
import React from "react";

const Badge = ({ status }) => {
  let bgColor = "";
  let textColor = "";

  switch (status) {
    case "Good":
      bgColor = "bg-green-100";
      textColor = "text-green-700";
      break;
    case "Low stock":
      bgColor = "bg-yellow-100";
      textColor = "text-yellow-700";
      break;
    case "Out of Stock":
      bgColor = "bg-red-100";
      textColor = "text-red-700";
      break;
    default:
      bgColor = "bg-gray-100";
      textColor = "text-gray-700";
  }

  return (
    <span className={`px-3 py-1 rounded-full font-medium text-xs ${bgColor} ${textColor}`}>
      {status}
    </span>
  );
};

export default Badge;
