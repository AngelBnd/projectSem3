import React, { useState } from "react";
import FilterTabs from "../components/globalComponents/FilterTabs";
import { Box, Grid, Card, CardContent, Typography } from "@mui/material";
import SearchBar from "../components/globalComponents/SearchBar";
import Button from "../components/globalComponents/Button";
import { PlusIcon, ExportIcon } from "../assets/SvgIcons";
import ViewSwitch from "../components/globalComponents/ViewSwitch";
import FilterButtonV2 from "../components/globalComponents/FilterButtonV2";
import DataTable from '../components/globalComponents/DataTable';
import { IconButton, Tooltip } from "@mui/material";
import { LookFurtherMoreIntoWhatIsClickedIcon, ThreeDotsIcon } from "../assets/SvgIcons";
import Badge from "../components/globalComponents/BadgeStatus";

// PLACEHOLDER
const products = [
  { id: 1, name: "Product A", category: "electronics" },
  { id: 2, name: "Product B", category: "clothing" },
  { id: 3, name: "Product C", category: "electronics" },
  { id: 4, name: "Product D", category: "clothing" },
];


// 1. DEFINE MOCK DATA (In a real app, this comes from an API)
const salesRows = [
  { 
    id: 101, 
    customer: 'Alice Johnson', 
    date: '2025-11-03', 
    total: 250.75, 
    channel: 'Online', 
    status: 'Pending' 
  },
  { 
    id: 102, 
    customer: 'Bob Smith', 
    date: '2025-11-02', 
    total: 1299.99, 
    channel: 'In-Store', 
    status: 'Completed' 
  },
  { 
    id: 103, 
    customer: 'Charlie Lee', 
    date: '2025-11-01', 
    total: 75.50, 
    channel: 'Online', 
    status: 'Cancelled' 
  },
  { 
    id: 104, 
    customer: 'Diana Prince', 
    date: '2025-10-30', 
    total: 450.00, 
    channel: 'Online', 
    status: 'Delivered' 
  },
  { 
    id: 105, 
    customer: 'Ethan Hunt', 
    date: '2025-10-29', 
    total: 320.20, 
    channel: 'In-Store', 
    status: 'Completed' 
  },
];


const salesColumns = [
  { field: 'id', headerName: 'Invoice ID', width: 100 },
  { field: 'customer', headerName: 'Customer', width: 150 },
  { field: 'date', headerName: 'Date', width: 120 },
  { 
    field: 'total', 
    headerName: 'Total', 
    width: 120, 
    type: 'number',
    valueFormatter: (params) => `Rp ${params.value?.toFixed(2) || '0,00'}`
  },
  { field: 'channel', headerName: 'Channel', width: 120 },
  { 
    field: 'status', 
    headerName: 'Status', 
    width: 120,
    renderCell: (params) => (
      <Badge 
        status={params.value}
      />
    )
  },
  {
    field: 'actions',
    headerName: 'Actions',
    width: 100,
    align: 'center',
    headerAlign: 'center',
    sortable: false,
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
        <Tooltip title="View Product">
          <IconButton
            onClick={() => alert(`Viewing product ${params.row.id}`)}
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
  },
];

const SalesTopBoxes = () => {


  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-2">
      <div className="bg-white p-6 shadow rounded-md flex flex-col justify-center">
        <p className="text-3xl font-nunito font-bold">123</p>
        <span className="text-gray-600 mt-1 text-sm">Total Orders</span>
      </div>

      <div className="bg-white p-6 shadow rounded-md flex flex-col justify-center">
        <p className="text-3xl font-nunito font-bold">123</p>
        <span className="text-gray-600 mt-1 text-sm">Total Pending Orders</span>
      </div>

      <div className="bg-white p-6 shadow rounded-md flex flex-col justify-center">
        <p className="text-3xl font-nunito font-bold">123</p>
        <span className="text-gray-600 mt-1 text-sm">Completed</span>
      </div>

      <div className="bg-white p-6 shadow rounded-md flex flex-col justify-center">
        <p className="text-3xl font-nunito font-bold">123</p>
        <span className="text-gray-600 mt-1 text-sm">Cancelled</span>
      </div>
    </div>
  );
};


// PLACEHOLDER FILTER TABS
const tabs = [
  {
    label: "All",
    filterFn: (data) => data,
  },
  {
    label: "Pending",
    filterFn: (data) => data.filter((p) => p.category === "Items"),
  },
  {
    label: "Delivered",
    filterFn: (data) => data.filter((p) => p.category === "Services"),
  },
{
    label: "Cancelled",
    filterFn: (data) => data.filter((p) => p.category === "Services"),
  },
{
    label: "Completed",
    filterFn: (data) => data.filter((p) => p.category === "Services"),
  },

];

export default function SalesPage() {
  const [filteredProducts, setFilteredProducts] = useState(products);
  const [data, setData] = React.useState(salesRows);
  const [loading, setLoading] = React.useState(false);

  
  const addProductButton = (
    <Button icon={PlusIcon} onClick={() => alert('Opening add form')}>
      Add Product
    </Button>
  );
  return (
    <div className="grid grid-cols-9 gap-3 w-full text-black mb-10 !overflow-x-hidden">
      <div className="col-span-9 flex flex-col mb-2 w-full"> 
        <h1 className="text-2xl font-semibold font-nunito">Sales</h1>
        <h3 className="text-[#777B7C] text-sm">Overview of your store's orders</h3>
      </div>

      <div className="col-span-9 ">
        <SalesTopBoxes/>
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
            children={"Export"}
            icon={ExportIcon}
            variant="white"
          />
          <Button
            onClick={()=>{}}
            children={"Create Order"}
            icon={PlusIcon}
            variant="primary"
            iconPosition="left"
          />
        </div>
      </div>

      <div className="col-span-9 flex flex-col justify-start items-start gap-3 sm:flex-row sm:justify-between sm:items-center">
          <div className="flex gap-2 w-full sm:w-auto items-center"> 
            <SearchBar
           
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
            columns={salesColumns}
            loading={loading}
            CustomToolbar={addProductButton}
            gridProps={{ checkboxSelection: true }} 
          />
        </div>
        

    </div>
  );
}
