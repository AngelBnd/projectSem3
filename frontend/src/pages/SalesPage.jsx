import React, { useState, useEffect } from "react";
import FilterTabs from "../components/globalComponents/FilterTabs";
import { Box, Grid, Card, CardContent, Typography } from "@mui/material";
import SearchBar from "../components/globalComponents/SearchBar";
import Button from "../components/globalComponents/Button";
import { PlusIcon, ExportIcon } from "../assets/SvgIcons";
import ViewSwitch from "../components/globalComponents/ViewSwitch";
import FilterButtonV2 from "../components/globalComponents/FilterButtonV2";
import DataTable from "../components/globalComponents/DataTable";
import { IconButton, Tooltip } from "@mui/material";
import {
  LookFurtherMoreIntoWhatIsClickedIcon,
  ThreeDotsIcon,
} from "../assets/SvgIcons";
import Badge from "../components/globalComponents/BadgeStatus";
import { useNavigate } from "react-router-dom";
import handleExportPDFSalesOrder from "../utils/files/handleDownloadPdfSalesOrder";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { EditIcon, TrashIcon } from "../assets/SvgIcons";

// PLACEHOLDER
const products = [
  { id: 1, name: "Product A", category: "electronics" },
  { id: 2, name: "Product B", category: "clothing" },
  { id: 3, name: "Product C", category: "electronics" },
  { id: 4, name: "Product D", category: "clothing" },
];

const salesColumns = [
  { field: "id", headerName: "ID", width: 50 },
  { field: "customer", headerName: "Customer", width: 150 },
  { field: "date", headerName: "Date", width: 100 },
  {
    field: "totalAmount",
    headerName: "Total",
    width: 140,
    type: "number",
    renderCell: (params) => `Rp ${Number(params.value ?? 0).toFixed(2)}`,
  },
  { field: "channel", headerName: "Channel", width: 120 },
  { field: "subChannel", headerName: "Sub Channel", width: 160 },
  {
    field: "deliveryStatus",
    headerName: "Delivery Status",
    width: 150,
    renderCell: (params) => <Badge status={params.value} />,
  },
  {
    field: "paymentStatus",
    headerName: "Payment Status",
    width: 150,
    renderCell: (params) => <Badge status={params.value} />,
  },
  {
    field: "actions",
    headerName: "Actions",
    width: 100,
    align: "center",
    headerAlign: "center",
    sortable: false,
    renderCell: (params) => {
      const [anchorEl, setAnchorEl] = React.useState(null);
      const open = Boolean(anchorEl);

      const handleOpen = (event) => {
        setAnchorEl(event.currentTarget);
      };

      const handleClose = () => {
        setAnchorEl(null);
      };

      return (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 1,
            height: "100%",
          }}
        >
          {/* View */}
          <Tooltip title="View">
            <IconButton
              onClick={() => navigate(`/sales/${params.row.id}`)}
              sx={{
                backgroundColor: "rgba(51, 118, 252, 0.1)",
                color: "#3376FC",
                "&:hover": { backgroundColor: "rgba(51, 118, 252, 0.18)" },
                width: 28,
                height: 28,
              }}
            >
              <LookFurtherMoreIntoWhatIsClickedIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          {/* More */}
          <Tooltip title="More actions">
            <IconButton
              onClick={handleOpen}
              sx={{
                backgroundColor: "rgba(51, 118, 252, 0.1)",
                color: "#3376FC",
                "&:hover": { backgroundColor: "rgba(51, 118, 252, 0.18)" },
                width: 28,
                height: 28,
              }}
            >
              <ThreeDotsIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
            slotProps={{
              paper: {
                sx: {
                  boxShadow: "0px 4px 12px rgba(0,0,0,0.08)",
                },
              },
            }}
          >
            <MenuItem
              onClick={() => {
                handleClose();
                navigate(`/sales/edit/${params.row.id}`);
              }}
            >
              <div className="flex gap-3">
                <EditIcon className="text-blue-500" />
                Edit
              </div>
            </MenuItem>

            <MenuItem
              onClick={() => {
                handleClose();
                // confirm dialog recommended
                console.log("Delete", params.row.id);
              }}
              sx={{ color: "error.main" }}
            >
              <div className="flex gap-3">
                <TrashIcon className="text-red-500" />
                Delete
              </div>
            </MenuItem>
          </Menu>
        </Box>
      );
    },
  },
];

const SalesTopBoxes = ({ total, delivered, paid, unpaid }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-2">
      <div className="bg-white p-6 shadow rounded-md">
        <p className="text-3xl font-bold">{total}</p>
        <span className="text-gray-600 text-sm">Total Orders</span>
      </div>

      <div className="bg-white p-6 shadow rounded-md">
        <p className="text-3xl font-bold">{delivered}</p>
        <span className="text-gray-600 text-sm">Delivered</span>
      </div>

      <div className="bg-white p-6 shadow rounded-md">
        <p className="text-3xl font-bold">{paid}</p>
        <span className="text-gray-600 text-sm">Paid</span>
      </div>

      <div className="bg-white p-6 shadow rounded-md">
        <p className="text-3xl font-bold">{unpaid}</p>
        <span className="text-gray-600 text-sm">Unpaid</span>
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
  const [data, setData] = useState([]);
  const [loading, setLoading] = React.useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [selectionModel, setSelectionModel] = useState([]);
  const [searchInput, setSearchInput] = useState("");

  const totalOrders = data.length;

  const deliveredOrders = data.filter(
    (row) => row.deliveryStatus === "DELIVERED"
  ).length;

  const paidOrders = data.filter((row) => row.paymentStatus === "PAID").length;

  const unpaidOrders = data.filter(
    (row) => row.paymentStatus === "UNPAID"
  ).length;
  useEffect(() => {
    fetchSalesOrders();
  }, []);

  const filteredData = data.filter((row) => {
    if (!searchInput) return true;

    const q = searchInput.toLowerCase();

    return (
      row.customer?.toLowerCase().includes(q) ||
      row.id?.toString().includes(q) ||
      row.channel?.toLowerCase().includes(q) ||
      row.subChannel?.toLowerCase().includes(q)
    );
  });

  const fetchSalesOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/sales-order", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Failed to load sales orders");
      }

      setData(result);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const addProductButton = (
    <Button icon={PlusIcon} onClick={() => alert("Opening add form")}>
      Add Product
    </Button>
  );

  const handleExport = () => {
    const rowsToExport =
      selectionModel.length > 0
        ? data.filter((row) => selectionModel.includes(row.id))
        : data;

    handleExportPDFSalesOrder(rowsToExport);
  };
  return (
    <div className="grid grid-cols-9 gap-3 w-full text-black mb-10 !overflow-x-hidden">
      <div className="col-span-9 flex flex-col mb-2 w-full">
        <h1 className="text-2xl font-semibold font-nunito">Sales</h1>
        <h3 className="text-[#777B7C] text-sm">
          Overview of your store's orders
        </h3>
      </div>

      <div className="col-span-9 ">
        <SalesTopBoxes
          total={totalOrders}
          delivered={deliveredOrders}
          paid={paidOrders}
          unpaid={unpaidOrders}
        />
      </div>

      <div className="col-span-9 flex flex-col justify-start items-start gap-4 sm:flex-row sm:justify-between sm:items-start">
        <FilterTabs
          tabs={tabs}
          // data={products}
          // onChange={(newData) => setFilteredProducts(newData)}
        />

        <div className="flex gap-3 items-center">
          <Button
            onClick={handleExport}
            children={"Export All"}
            icon={ExportIcon}
            variant="white"
          />
          <Button
            onClick={() => navigate("/sales/create-order-sales")}
            children={"Create Order"}
            icon={PlusIcon}
            variant="primary"
            iconPosition="left"
          />
        </div>
      </div>

      <div className="col-span-9 flex flex-col justify-start items-start gap-3 sm:flex-row sm:justify-between sm:items-center">
        <div className="flex gap-2 w-full sm:w-auto items-center">
          <SearchBar value={searchInput} setSearchInput={setSearchInput} />
          <ViewSwitch />
        </div>

        {/* <div className="sm:ml-auto">
          <FilterButtonV2 children={"Filter"} />
        </div> */}
      </div>

      <div className="col-span-9">
        <DataTable
          title="Sales Orders"
          rows={filteredData}
          columns={salesColumns}
          loading={loading}
          CustomToolbar={addProductButton}
          gridProps={{
            checkboxSelection: true,

            onRowSelectionModelChange: (newSelection) => {
              setSelectionModel(newSelection);
            },
          }}
        />
      </div>
    </div>
  );
}
