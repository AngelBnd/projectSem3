import { useMemo, useState } from "react";
import type { GridColDef } from "@mui/x-data-grid";
import SearchBar from "../../../components/globalComponents/SearchBar";
import FilterDropdown from "../../../components/globalComponents/FilterButton";
import Button from "../../../components/globalComponents/Button";
import DataTable from "../../../components/globalComponents/DataTable";
import ColorTag from "../../../components/globalComponents/ColorTag";
import { ExportIcon, PlusIcon, ThreeDotsIcon } from "../../../assets/SvgIcons";

interface SupplierRow {
  id: number;
  name: string;
  contact: string;
  phone: string;
  totalProducts: number;
  lastTransaction: string;
  status: "Active" | "Inactive";
}

const SUPPLIERS: SupplierRow[] = [
  { id: 1, name: "ASASASASAS", contact: "me", phone: "+62 812 3456 789", totalProducts: 12312, lastTransaction: "20/12/2020", status: "Active" },
  { id: 2, name: "20/20/2020", contact: "Product 1", phone: "+62 812 3456 789", totalProducts: 12312, lastTransaction: "20/12/2020", status: "Active" },
  { id: 3, name: "20/20/2020", contact: "Product 1", phone: "+62 812 3456 789", totalProducts: 12312, lastTransaction: "20/12/2020", status: "Active" },
];

const STATUS_FILTER = ["All", "Active", "Inactive"];

const columns: GridColDef<SupplierRow>[] = [
  { field: "name", headerName: "Supplier Name", flex: 1, minWidth: 150 },
  { field: "contact", headerName: "Contact Person", flex: 1, minWidth: 140 },
  { field: "phone", headerName: "Phone", flex: 1, minWidth: 150 },
  { field: "totalProducts", headerName: "Total Products", flex: 1, minWidth: 130 },
  { field: "lastTransaction", headerName: "Last Transaction", flex: 1, minWidth: 140 },
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
    width: 90,
    sortable: false,
    filterable: false,
    disableColumnMenu: true,
    renderCell: () => (
      <button type="button" className="!bg-transparent">
        <ThreeDotsIcon />
      </button>
    ),
  },
];

export default function Suppliers() {
  const [searchInput, setSearchInput] = useState("");
  const [status, setStatus] = useState("All");

  const rows = useMemo(() => {
    const q = searchInput.trim().toLowerCase();
    return SUPPLIERS.filter(
      (r) =>
        (status === "All" || r.status === status) &&
        (!q || r.name.toLowerCase().includes(q)),
    );
  }, [searchInput, status]);

  return (
    <div className="grid grid-cols-9 gap-3 w-full text-black mb-10 !overflow-x-hidden">
      <div className="col-span-9 flex flex-col mb-2 w-full">
        <h1 className="text-2xl font-semibold font-nunito">Suppliers</h1>
        <h3 className="text-[#777B7C] text-sm">Overview of suppliers</h3>
      </div>

      <div className="col-span-9 flex gap-3 mb-2">
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

        <div className="flex gap-3 items-center">
          <FilterDropdown
            label="Filter"
            options={STATUS_FILTER}
            selectedValue={status}
            onSelect={setStatus}
          />
          <Button onClick={() => {}} icon={ExportIcon} variant="white">
            Export All
          </Button>
          <Button onClick={() => {}} icon={PlusIcon} variant="primary">
            Add Supplier
          </Button>
        </div>
      </div>

      <div className="col-span-9">
        <DataTable
          title="Suppliers"
          rows={rows}
          columns={columns}
          gridProps={{ checkboxSelection: true }}
        />
      </div>
    </div>
  );
}
