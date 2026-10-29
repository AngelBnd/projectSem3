import { useMemo, useState } from "react";
import type { MouseEvent } from "react";
import type {
  GridColDef,
  GridRenderCellParams,
  GridRowSelectionModel,
} from "@mui/x-data-grid";
import FilterTabs, {
  type FilterTab,
} from "../../../components/globalComponents/FilterTabs";
import type { SalesOrderSummary } from "../../../types";
import { ApiError } from "../../../lib/api";
import { Box, Grid, Card, CardContent, Typography } from "@mui/material";
import SearchBar from "../../../components/globalComponents/SearchBar";
import Button from "../../../components/globalComponents/Button";
import { PlusIcon, ExportIcon } from "../../../assets/SvgIcons";
import ViewSwitch from "../../../components/globalComponents/ViewSwitch";
import FilterButtonV2 from "../../../components/globalComponents/FilterButtonV2";
import DataTable from "../../../components/globalComponents/DataTable";
import { IconButton, Tooltip } from "@mui/material";
import {
  LookFurtherMoreIntoWhatIsClickedIcon,
  ThreeDotsIcon,
} from "../../../assets/SvgIcons";
import Badge from "../../../components/globalComponents/BadgeStatus";
import { useNavigate } from "react-router-dom";
import handleExportPDFSalesOrder from "../../../utils/files/handleDownloadPdfSalesOrder";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { EditIcon, TrashIcon } from "../../../assets/SvgIcons";
import { usePopup } from "../../../components/globalComponents/PopupContext";
import { deleteSalesOrder, populateSalesOrder, type OrderId } from "../api";
import useSalesOrders from "../hooks/useSalesOrders";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  PopupOption,
  PopupError,
  PopupOkay,
} from "../../../components/globalComponents/PopupComp";
import SalesOrderActionsCell from "../components/SalesOrderActionsCell";

// PLACEHOLDER
const products = [
  { id: 1, name: "Product A", category: "electronics" },
  { id: 2, name: "Product B", category: "clothing" },
  { id: 3, name: "Product C", category: "electronics" },
  { id: 4, name: "Product D", category: "clothing" },
];

interface SalesTopBoxesProps {
  total: number;
  delivered: number;
  paid: number;
  unpaid: number;
}

const SalesTopBoxes = ({
  total,
  delivered,
  paid,
  unpaid,
}: SalesTopBoxesProps) => {
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
const tabs: FilterTab<SalesOrderSummary>[] = [
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
        (r) => r.deliveryStatus === "DELIVERED" && r.paymentStatus === "PAID",
      ),
  },
];
export default function SalesPage() {
  const [filteredProducts, setFilteredProducts] = useState(products);
  const { openPopup, closePopup } = usePopup();
  const {
    orders: allOrders,
    loading,
    error: salesOrdersError,
  } = useSalesOrders();
  const queryClient = useQueryClient();
  const deleteMutation = useMutation({
    mutationFn: deleteSalesOrder,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["salesOrders"] }),
        queryClient.invalidateQueries({ queryKey: ["dashboard"] }),
      ]);
    },
  });
  const populateMutation = useMutation({
    mutationFn: populateSalesOrder,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["salesOrders"] }),
        queryClient.invalidateQueries({ queryKey: ["dashboard"] }),
      ]);
    },
  });
  const navigate = useNavigate();
  const [selectionModel, setSelectionModel] = useState<GridRowSelectionModel>({
    type: "include",
    ids: new Set(),
  });
  const [searchInput, setSearchInput] = useState("");
  const [activeTab, setActiveTab] = useState(0);
  const totalOrders = allOrders.length;
  const deliveredOrders = allOrders.filter(
    (row) => row.deliveryStatus === "DELIVERED",
  ).length;
  const paidOrders = allOrders.filter(
    (row) => row.paymentStatus === "PAID",
  ).length;
  const unpaidOrders = allOrders.filter(
    (row) => row.paymentStatus === "UNPAID",
  ).length;

  const AUTO_CLOSE_MS = 2000;

  const handlePopulateSalesOrder = async () => {
    try {
      await populateMutation.mutateAsync();

      alert("Demo sales order created (RANDOMIZED STATUSES FOR FILTERING)");
    } catch (err) {
      if (err instanceof ApiError && err.message === "NO_PRODUCTS") {
        alert("No products found to create demo order");
        return;
      }

      console.error(err);
      alert("Failed to populate sales order");
    }
  };

  const handleDeleteSalesOrder = (salesOrderId: OrderId) => {
    const message = `Are you sure you want to delete sales order #${salesOrderId}?`;

    openPopup(<PopupOption message={message} type="delete" />, async () => {
      closePopup();

      try {
        try {
          await deleteMutation.mutateAsync(salesOrderId);
        } catch (err) {
          const message =
            err instanceof ApiError ? err.data.message : undefined;
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
            />,
          );
          setTimeout(() => closePopup(), 2000);
        }, 300);
      } catch (err) {
        console.error(err);
        setTimeout(() => {
          openPopup(
            <PopupError message="Failed to delete sales order" show={true} />,
          );
          setTimeout(() => closePopup(), 2000);
        }, 300);
      }
    });
  };

  const data = useMemo(() => {
    const statusFilter = ["all", "delivered", "paid", "cancelled", "completed"][
      activeTab
    ];
    const query = searchInput.toLowerCase();

    return allOrders.filter((order) => {
      if (
        statusFilter === "delivered" &&
        order.deliveryStatus !== "DELIVERED"
      ) {
        return false;
      }
      if (
        statusFilter === "cancelled" &&
        order.deliveryStatus !== "CANCELLED"
      ) {
        return false;
      }
      if (statusFilter === "paid" && order.paymentStatus !== "PAID") {
        return false;
      }
      if (
        statusFilter === "completed" &&
        (order.deliveryStatus !== "DELIVERED" || order.paymentStatus !== "PAID")
      ) {
        return false;
      }
      if (!query) return true;

      return (
        (order.customer ?? "").toLowerCase().includes(query) ||
        String(order.id).includes(query) ||
        (order.channel ?? "").toLowerCase().includes(query) ||
        (order.subChannel ?? "").toLowerCase().includes(query)
      );
    });
  }, [activeTab, allOrders, searchInput]);
  const addProductButton = (
    <Button icon={PlusIcon} onClick={() => alert("Opening add form")}>
      Add Product
    </Button>
  );

  const handleExport = () => {
    const { type, ids } = selectionModel;
    const rowsToExport =
      type === "exclude"
        ? data.filter((row) => !ids.has(row.id))
        : ids.size > 0
          ? data.filter((row) => ids.has(row.id))
          : data;

    handleExportPDFSalesOrder(rowsToExport);
  };

  if (salesOrdersError)
    return <div>Error fetching sales orders: {salesOrdersError.message}</div>;

  const salesColumns: GridColDef<SalesOrderSummary>[] = [
    { field: "id", headerName: "ID", width: 50 },
    { field: "customer", headerName: "Customer", width: 150 },
    { field: "date", headerName: "Date", width: 100 },
    {
      field: "totalAmount",
      headerName: "Total",
      width: 140,
      type: "number",
      renderCell: (params: GridRenderCellParams) =>
        `Rp ${Number(params.value ?? 0).toFixed(2)}`,
    },
    { field: "channel", headerName: "Channel", width: 120 },
    { field: "subChannel", headerName: "Sub Channel", width: 160 },
    {
      field: "deliveryStatus",
      headerName: "Delivery Status",
      width: 150,
      renderCell: (params: GridRenderCellParams) => (
        <Badge status={params.value} />
      ),
    },
    {
      field: "paymentStatus",
      headerName: "Payment Status",
      width: 150,
      renderCell: (params: GridRenderCellParams) => (
        <Badge status={params.value} />
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 100,
      align: "center",
      headerAlign: "center",
      sortable: false,
      renderCell: (params: GridRenderCellParams<SalesOrderSummary>) => (
        <SalesOrderActionsCell
          params={params}
          onDelete={handleDeleteSalesOrder}
        />
      ),
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
          activeTab={activeTab}
          onChange={(index) => setActiveTab(index)}
        />
        <div className="flex gap-3 items-center">
          {/* <Button
            onClick={handlePopulateSalesOrder}
            children="Populate (for demo)"
            icon={PlusIcon}
            variant="primary"
            iconPosition="left"
          /> */}
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
