import { useMemo, useState } from "react";
import type { GridColDef } from "@mui/x-data-grid";
import { MenuItem, Pagination, Select } from "@mui/material";
import SearchBar from "../../../components/globalComponents/SearchBar";
import FilterDropdown from "../../../components/globalComponents/FilterButton";
import Button from "../../../components/globalComponents/Button";
import DataTable from "../../../components/globalComponents/DataTable";
import ColorTag from "../../../components/globalComponents/ColorTag";
import { ExportIcon, PlusIcon, ThreeDotsIcon } from "../../../assets/SvgIcons";
import { data } from "react-router-dom";

interface PurchaseOrderRow {
  id: number;
  name: string;
  contact: string;
  phone: string;
  totalProducts: number;
  lastTransaction: string;
  status: "Active" | "Inactive";
}

const ROWS: PurchaseOrderRow[] = [1, 2, 3].map((id) => ({
  id,
  name: "20/20/2020",
  contact: "Product 1",
  phone: "+62 812 3456 789",
  totalProducts: 12312,
  lastTransaction: "20/12/2020",
  status: "Active",
}));

const STATUS_FILTER = ["All", "Active", "Inactive"];

function MagnifierIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#3376FC"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="10" cy="10" r="7" />
      <path d="M21 21l-6 -6" />
    </svg>
  );
}

const columns: GridColDef<PurchaseOrderRow>[] = [
  { field: "name", headerName: "Supplier Name", flex: 1, minWidth: 140 },
  { field: "contact", headerName: "Contact Person", flex: 1, minWidth: 140 },
  { field: "phone", headerName: "Phone", flex: 1, minWidth: 150 },
  {
    field: "totalProducts",
    headerName: "Total Products",
    flex: 1,
    minWidth: 130,
  },
  {
    field: "lastTransaction",
    headerName: "Last Transaction",
    flex: 1,
    minWidth: 140,
  },
  {
    field: "status",
    headerName: "Status",
    flex: 1,
    minWidth: 110,
    renderCell: ({ value }) => (
      <ColorTag label={value} tone={value === "Active" ? "green" : "gray"} />
    ),
  },
  {
    field: "action",
    headerName: "Action",
    width: 110,
    sortable: false,
    filterable: false,
    disableColumnMenu: true,
    renderCell: () => (
      <div className="flex items-center gap-2">
        <button type="button" aria-label="View" className="!bg-transparent">
          <MagnifierIcon />
        </button>
        <button type="button" aria-label="More" className="!bg-transparent">
          <ThreeDotsIcon />
        </button>
      </div>
    ),
  },
];

export default function PurchaseOrders() {
  const [searchInput, setSearchInput] = useState("");
  const [status, setStatus] = useState("All");
  const [pageSize, setPageSize] = useState(8);
  const [page, setPage] = useState(1);

  const rows = useMemo(() => {
    const q = searchInput.trim().toLowerCase();
    return ROWS.filter(
      (r) =>
        (status === "All" || r.status === status) &&
        (!q || r.name.toLowerCase().includes(q)),
    );
  }, [searchInput, status]);

  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, 27);

  return (
    <div className="grid grid-cols-9 gap-3 w-full text-black mb-10 !overflow-x-hidden">
      <div className="col-span-9 flex flex-col gap-3 mb-2 w-full sm:flex-row sm:justify-between sm:items-start">
        <div className="flex flex-col">
          <h1 className="text-2xl font-semibold font-nunito">
            Purchase Orders
          </h1>
          <h3 className="text-[#777B7C] text-sm">Overview of suppliers</h3>
        </div>
      </div>

      <div className="col-span-9 grid grid-cols-1 gap-3 mb-2 md:grid-cols-4">
        {[
          { value: "257", label: "Total Suppliers" },
          { value: "234", label: "Active Suppliers" },
          { value: "23", label: "Inactive Suppliers" },
          { value: "123", label: "POs this month" },
        ].map((c) => (
          <div
            key={c.label}
            className="bg-white w-full h-[120px] rounded-lg shadow flex flex-col items-start justify-center px-5"
          >
            <p className="text-2xl font-bold font-nunito text-black">
              {c.value}
            </p>
            <p className="text-sm text-gray-600">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="col-span-9 flex flex-col justify-start items-start gap-3 sm:flex-row sm:justify-between sm:items-center">
        <div className="flex gap-2 w-full sm:w-auto items-center">
          <SearchBar
            setSearchInput={setSearchInput}
            value={searchInput}
            placeholder="Search by Supplier Name..."
          />
        </div>

        <div className="flex gap-2">
          <div className="flex gap-3 items-center">
            <Button onClick={() => {}} icon={ExportIcon} variant="white">
              Export All
            </Button>
            <Button onClick={() => {}} icon={PlusIcon} variant="primary">
              Add Supplier
            </Button>
          </div>
          <FilterDropdown
            label="Filter"
            options={STATUS_FILTER}
            selectedValue={status}
            onSelect={setStatus}
          />
        </div>
      </div>

      <div className="col-span-9">
        <DataTable
          title="Purchase Orders"
          rows={rows}
          columns={columns}
          gridProps={{ checkboxSelection: true, hideFooter: true }}
        />
      </div>
      <div className="col-span-9">
        <DataTable
          title="Product Inventory"
          rows={rows ?? []}
          columns={columns}
          gridProps={{ checkboxSelection: true }}
        />
      </div>
    </div>
  );
}
