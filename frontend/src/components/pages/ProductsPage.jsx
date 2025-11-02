import React, { useState } from "react";
import FilterTabs from "../FilterTabs"; // adjust path
import { Box, Grid, Card, CardContent, Typography } from "@mui/material";
import SearchBar from "../SearchBar";
import Button from "../Button";

// PLACEHOLDER
const products = [
  { id: 1, name: "Product A", category: "electronics" },
  { id: 2, name: "Product B", category: "clothing" },
  { id: 3, name: "Product C", category: "electronics" },
  { id: 4, name: "Product D", category: "clothing" },
];

// PLACEHOLDER FILTER TABS
const tabs = [
  {
    label: "All",
    filterFn: (data) => data,
  },
  {
    label: "Items",
    filterFn: (data) => data.filter((p) => p.category === "Items"),
  },
  {
    label: "Services",
    filterFn: (data) => data.filter((p) => p.category === "Services"),
  },
];

export default function ProductsPage() {
  const [filteredProducts, setFilteredProducts] = useState(products);

  return (
    <div className="grid grid-cols-9 gap-3 w-full text-black mb-10 !overflow-x-hidden">
      <div className="col-span-9 flex flex-col mb-2 w-full"> 
        <h1 className="text-3xl font-semibold font-nunito">Products</h1>
        <h3 className="text-[#777B7C]">Overview of your store's products</h3>
      </div>
      
     <div className="col-span-9 flex flex-col justify-start items-start gap-4 md:flex-row md:justify-between md:items-start">
        <FilterTabs
          tabs={tabs}
          data={products}
          // onChange={(newData) => setFilteredProducts(newData)}
        />
        
        <Button
        onClick={()=>{}}
        children={"teasdasdsst"}
        />
      </div>

    </div>
  );
}
