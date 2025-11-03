import React, { useState } from "react";
import FilterTabs from "../globalComponents/FilterTabs"; // adjust path
import { Box, Grid, Card, CardContent, Typography } from "@mui/material";
import SearchBar from "../globalComponents/SearchBar";
import Button from "../globalComponents/Button";
import { PlusIcon, ExportIcon } from "../../assets/SvgIcons";
import ViewSwitch from "../globalComponents/ViewSwitch";
import FilterButtonV2 from "../globalComponents/FilterButtonV2";
import DataTable from '../globalComponents/DataTable';
import { IconButton, Tooltip } from "@mui/material";
import { LookFurtherMoreIntoWhatIsClickedIcon, ThreeDotsIcon } from "../../assets/SvgIcons";
import Badge from "../globalComponents/BadgeStatus";

// PLACEHOLDER
const products = [
  { id: 1, name: "Product A", category: "electronics" },
  { id: 2, name: "Product B", category: "clothing" },
  { id: 3, name: "Product C", category: "electronics" },
  { id: 4, name: "Product D", category: "clothing" },
];


// 1. DEFINE MOCK DATA (In a real app, this comes from an API)
const productRows = [
  { id: 1, name: 'Laptop Pro', stock: 15, price: 1200.00 },
  { id: 2, name: 'Wireless Mouse', stock: 250, price: 25.50 },
  { id: 3, name: '4K Monitor', stock: 5, price: 450.00 },
];

// 2. DEFINE COLUMN CONFIGURATION (Unique to the Products page)
const productColumns = [
  { field: 'id', headerName: 'ID', width: 90 },
  { field: 'name', headerName: 'Product Name', flex: 1, minWidth: 250 },
  { field: 'stock', headerName: 'Stock', width: 120, type: 'number', align: 'right' },
  { 
    field: 'price', 
    headerName: 'Price', 
    width: 150, 
    type: 'number',
    valueFormatter: (params) => {

      if (params.value == null || !isFinite(params.value)) {
        return ''; // Return an empty string or '--' if the price is invalid or missing
      }
    }
  },
  {
    field: 'actions',
    headerName: 'Actions',
    sortable: false,
    width: 100,
    align: 'center',
    headerAlign: 'center',
    renderCell: (params) => (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center', 
          justifyContent: 'center', 
          gap: 1.2,
          height: '100%',
        }}
      >
        <Tooltip title="Edit Product">
          <IconButton
            onClick={() => alert(`Editing product ${params.row.id}`)}
            sx={{
              backgroundColor: 'rgba(51, 118, 252, 0.1)',
              color: '#3376FC',
              '&:hover': { backgroundColor: 'rgba(51, 118, 252, 0.18)' },
              width: 28,   
              height: 28, 
              p: 0.7,     
            }}
          >
            <LookFurtherMoreIntoWhatIsClickedIcon
              sx={{ fontSize: 12 }}
            />
          </IconButton>
        </Tooltip>

        <Tooltip title="More Actions">
          <IconButton
            sx={{
              backgroundColor: 'rgba(51, 118, 252, 0.1)', 
              color: '#3376FC',
              '&:hover': { backgroundColor: 'rgba(51, 118, 252, 0.18)' },
              width: 28,
              height: 28,
              p: 0.7,
            }}
          >
            <ThreeDotsIcon sx={{ fontSize: 14 }} /> {/* ✅ smaller icon */}
          </IconButton>
        </Tooltip>
      </Box>
    ),
  }

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
  const [data, setData] = React.useState(productRows);
  const [loading, setLoading] = React.useState(false);

  
  const addProductButton = (
    <Button icon={PlusIcon} onClick={() => alert('Opening add form')}>
      Add Product
    </Button>
  );
  return (
    <div className="grid grid-cols-9 gap-3 w-full text-black mb-10 !overflow-x-hidden">
      <div className="col-span-9 flex flex-col mb-2 w-full"> 
        <h1 className="text-2xl font-semibold font-nunito">Products</h1>
        <h3 className="text-[#777B7C] text-sm">Overview of your store's products</h3>
      </div>
      
     <div className="col-span-9 flex flex-col justify-start items-start gap-4 sm:flex-row sm:justify-between sm:items-start">
        <FilterTabs
          tabs={tabs}
          // data={products}
          // onChange={(newData) => setFilteredProducts(newData)}
        />
        
        <div className="flex gap-3 items-center">
          <Button
            onClick={()=>{}}
            children={"white"}
            icon={ExportIcon}
            variant="white"
          />
          <Button
            onClick={()=>{}}
            children={"Add a Product"}
            icon={PlusIcon}
            variant="primary"
            iconPosition="right"
          />
        </div>
      </div>

      <div className="col-span-9 flex flex-col justify-start items-start gap-3 sm:flex-row sm:justify-between sm:items-center">
          <div className="flex gap-2 w-full sm:w-auto items-center"> 
            <SearchBar
            variant="canScan"
            />
            <ViewSwitch/> 
          </div>
          
          <div className="sm:ml-auto"> 
            <FilterButtonV2
              children={"Filter"}
            />
          </div>
        </div>

        <div className="col-span-9">
          <DataTable
            title="Product Inventory"
            rows={data}
            columns={productColumns}
            loading={loading}
            CustomToolbar={addProductButton}
            gridProps={{ checkboxSelection: true }} 
          />
        </div>
        

    </div>
  );
}
