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
import { usePopup } from "../components/globalComponents/PopupContext";
import { api } from "../lib/api";
import {
  PopupOption,
  PopupError,
  PopupOkay,
} from "../components/globalComponents/PopupComp";

// PLACEHOLDER
const products = [
  { id: 1, name: "Product A", category: "electronics" },
  { id: 2, name: "Product B", category: "clothing" },
  { id: 3, name: "Product C", category: "electronics" },
  { id: 4, name: "Product D", category: "clothing" },
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
    filterFn: (rows) => rows,
  },
  {
    label: "Delivered",
    filterFn: (rows) => rows.filter((r) => r.deliveryStatus === "DELIVERED"),
  },
  {
    label: "Paid",
    filterFn: (rows) => rows.filter((r) => r.paymentStatus === "PAID"),
  },
  {
    label: "Cancelled",
    filterFn: (rows) => rows.filter((r) => r.deliveryStatus === "CANCELLED"),
  },
  {
    label: "Completed",
    filterFn: (rows) =>
      rows.filter(
        (r) => r.deliveryStatus === "DELIVERED" && r.paymentStatus === "PAID"
      ),
  },
];
export default function SalesPage() {
  const [filteredProducts, setFilteredProducts] = useState(products);
  const { openPopup, closePopup } = usePopup();
  const [allOrders, setAllOrders] = useState([]);
  const [data, setData] = useState([]);
  const [loading, setLoading] = React.useState(false);
  const navigate = useNavigate();
  const [selectionModel, setSelectionModel] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [activeTab, setActiveTab] = useState(0);
  const totalOrders = allOrders.length;
  const deliveredOrders = allOrders.filter(
    (row) => row.deliveryStatus === "DELIVERED"
  ).length;
  const paidOrders = allOrders.filter(
    (row) => row.paymentStatus === "PAID"
  ).length;
  const unpaidOrders = allOrders.filter(
    (row) => row.paymentStatus === "UNPAID"
  ).length;

  const AUTO_CLOSE_MS = 2000;

  useEffect(() => {
    fetchSalesOrders();
  }, []);

  useEffect(() => {
    applySearchAndTabFilter();
  }, [searchInput, activeTab, allOrders]);

  const populateSalesOrder = async () => {
    try {
      await api.post("/api/sales-order/populate");

      alert("Demo sales order created (RANDOMIZED STATUSES FOR FILTERING)");
      window.location.reload();
    } catch (err) {
      if (err.message === "NO_PRODUCTS") {
        alert("No products found to create demo order");
        return;
      }

      console.error(err);
      alert("Failed to populate sales order");
    }
  };

  const handleDeleteSalesOrder = (salesOrderId) => {
    const message = `Are you sure you want to delete sales order #${salesOrderId}?`;

    openPopup(<PopupOption message={message} type="delete" />, async () => {
      closePopup();

      try {
        try {
          await api.delete(`/api/sales-order/${salesOrderId}`);
        } catch (err) {
          const message = err.data?.message;
          const errorMessage =
            message === "ORDER_NOT_DELETABLE"
              ? "Cannot delete sales order of pending or completed"
              : message || "Failed to delete sales order";

          setTimeout(() => {
            setTimeout(() => {
              openPopup(<PopupError message={errorMessage} show={true} />);
              setTimeout(() => closePopup(), 2000);
            }, 300);
          }, 300);
          return;
        }

        setTimeout(() => {
          openPopup(
            <PopupOkay
              message={`Sales order #${salesOrderId} deleted successfully`}
              show={true}
            />
          );
          setTimeout(() => closePopup(), 2000);

          fetchSalesOrders();
        }, 300);
      } catch (err) {
        console.error(err);
        setTimeout(() => {
          openPopup(
            <PopupError message="Failed to delete sales order" show={true} />
          );
          setTimeout(() => closePopup(), 2000);
        }, 300);
      }
    });
  };

  const fetchSalesOrders = async () => {
    setLoading(true);
    try {
      const result = await api.get("/api/sales-order");

      setAllOrders(result || []);
      setData(result || []);
    } catch (err) {
      console.error(err);
      setAllOrders([]);
      setData([]);
    } finally {
      setLoading(false);
    }
  };
  const applySearchAndTabFilter = () => {
    let filtered = [...allOrders];

    const tabFilters = ["all", "delivered", "paid", "cancelled", "completed"];
    const statusFilter = tabFilters[activeTab];
    if (statusFilter && statusFilter !== "all") {
      if (statusFilter === "delivered")
        filtered = filtered.filter((r) => r.deliveryStatus === "DELIVERED");
      else if (statusFilter === "cancelled")
        filtered = filtered.filter((r) => r.deliveryStatus === "CANCELLED");
      else if (statusFilter === "paid")
        filtered = filtered.filter((r) => r.paymentStatus === "PAID");
      else if (statusFilter === "completed")
        filtered = filtered.filter(
          (r) => r.deliveryStatus === "DELIVERED" && r.paymentStatus === "PAID"
        );
    }

    if (searchInput) {
      const q = searchInput.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.customer.toLowerCase().includes(q) ||
          r.id.toString().includes(q) ||
          r.channel.toLowerCase().includes(q) ||
          r.subChannel.toLowerCase().includes(q)
      );
    }

    setData(filtered);
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

        const handleEditClick = () => {
          handleClose();

          const isPaid = params.row.paymentStatus === "PAID";
          const isDelivered = params.row.deliveryStatus === "DELIVERED";

          if (isPaid && isDelivered) {
            openPopup(
              <PopupError message="You cannot edit orders that are already Paid and Delivered." />
            );

            setTimeout(() => {
              closePopup();
            }, 2000);
          } else {
            navigate(`/sales/edit/${params.row.id}`);
          }
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
            {/* <Tooltip title="View">
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
            </Tooltip> */}

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
              <MenuItem onClick={handleEditClick}>
                <div className="flex gap-3">
                  <EditIcon className="text-blue-500" />
                  Edit
                </div>
              </MenuItem>

              <MenuItem
                onClick={() => {
                  handleClose();
                  handleDeleteSalesOrder(params.row.id);
                }}
                sx={{ color: "error.main" }}
              >
                <div className="flex gap-3 items-center">
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
          value={activeTab}
          onChange={(index) => setActiveTab(index)}
        />
        <div className="flex gap-3 items-center">
          <Button
            onClick={populateSalesOrder}
            children="Populate (for demo)"
            icon={PlusIcon}
            variant="primary"
            iconPosition="left"
          />
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
          <SearchBar
            value={searchInput}
            setSearchInput={setSearchInput}
            placeholder="Search by customer name..."
          />
          <ViewSwitch />
        </div>

        {/* <div className="sm:ml-auto">
          <FilterButtonV2 children={"Filter"} />
        </div> */}
      </div>

      <div className="col-span-9">
        <DataTable
          title="Sales Orders"
          rows={data}
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
