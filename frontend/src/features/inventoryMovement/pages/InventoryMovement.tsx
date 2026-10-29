import { useMemo, useState } from "react";
import type { GridColDef } from "@mui/x-data-grid";
import SearchBar from "../../../components/globalComponents/SearchBar";
import FilterDropdown from "../../../components/globalComponents/FilterButton";
import FilterTabs from "../../../components/globalComponents/FilterTabs";
import Button from "../../../components/globalComponents/Button";
import DataTable from "../../../components/globalComponents/DataTable";
import ColorTag, {
  type TagTone,
} from "../../../components/globalComponents/ColorTag";
import { ExportIcon, ThreeDotsIcon } from "../../../assets/SvgIcons";

type MovementType = "Inbound" | "Outbound" | "Adjustment";

interface MovementRow {
  id: number;
  timestamp: string;
  product: string;
  reference: string;
  type: MovementType;
  change: string;
  reason: string;
  performedBy: string;
}

const MOVEMENTS: MovementRow[] = [
  { id: 1, timestamp: "20/20/2020", product: "Product 1", reference: "INV-123123123", type: "Outbound", change: "-2", reason: "Sale", performedBy: "Human" },
  { id: 2, timestamp: "20/20/2020", product: "Product 2", reference: "INV-12309123", type: "Outbound", change: "-2", reason: "Sale", performedBy: "NotAHuman" },
  { id: 3, timestamp: "20/20/2020", product: "Product 3", reference: "AUD-123123", type: "Adjustment", change: "-2", reason: "Miscount", performedBy: "NotAHuman" },
  { id: 4, timestamp: "20/20/2020", product: "Product 5", reference: "ODR-23123", type: "Inbound", change: "+2", reason: "Purchase Order", performedBy: "NotAHuman" },
  { id: 5, timestamp: "20/20/2020", product: "Product 9", reference: "AUD-123123", type: "Adjustment", change: "-2", reason: "Unrecorded Receipt", performedBy: "NotAHuman" },
  { id: 6, timestamp: "22/20/2020", product: "Product 10", reference: "AUD-100000", type: "Adjustment", change: "-2", reason: "Unrecorded Receipt", performedBy: "NotAHuman" },
];

const REASON_TONE: Record<string, TagTone> = {
  Sale: "green",
  Miscount: "yellow",
  "Purchase Order": "blue",
  "Unrecorded Receipt": "pink",
};

const TABS = [
  { label: "All" },
  { label: "Inbound" },
  { label: "Outbound" },
  { label: "Adjustments" },
];
const TAB_TYPE: (MovementType | null)[] = [null, "Inbound", "Outbound", "Adjustment"];
const PERFORMERS = ["All", "Human", "NotAHuman"];

const columns: GridColDef<MovementRow>[] = [
  { field: "timestamp", headerName: "TimeStamp", flex: 1, minWidth: 110 },
  { field: "product", headerName: "Product", flex: 1, minWidth: 110 },
  { field: "reference", headerName: "Reference", flex: 1, minWidth: 140 },
  { field: "type", headerName: "Type", flex: 1, minWidth: 110 },
  { field: "change", headerName: "Change", flex: 1, minWidth: 90 },
  {
    field: "reason",
    headerName: "Reason",
    flex: 1,
    minWidth: 170,
    renderCell: ({ value }) => (
      <ColorTag label={value} tone={REASON_TONE[value as string] ?? "gray"} />
    ),
  },
  { field: "performedBy", headerName: "Performed By", flex: 1, minWidth: 130 },
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

export default function InventoryMovement() {
  const [searchInput, setSearchInput] = useState("");
  const [activeTab, setActiveTab] = useState(0);
  const [performer, setPerformer] = useState("All");

  const rows = useMemo(() => {
    const q = searchInput.trim().toLowerCase();
    const type = TAB_TYPE[activeTab];
    return MOVEMENTS.filter(
      (r) =>
        (!type || r.type === type) &&
        (performer === "All" || r.performedBy === performer) &&
        (!q ||
          r.product.toLowerCase().includes(q) ||
          r.reference.toLowerCase().includes(q)),
    );
  }, [searchInput, activeTab, performer]);

  return (
    <div className="grid grid-cols-9 gap-3 w-full text-black mb-10 !overflow-x-hidden">
      <div className="col-span-9 flex flex-col mb-2 w-full">
        <h1 className="text-2xl font-semibold font-nunito">
          Inventory Movement
        </h1>
        <h3 className="text-[#777B7C] text-sm">
          Overview of your Inventory's movements
        </h3>
      </div>

      <div className="col-span-9 flex gap-3 mb-2">
        {[
          { value: "27", label: "Total Movements", hint: "" },
          { value: "+20 Units", label: "Stock Inbound", hint: "" },
          { value: "-20 Units", label: "Stock Outbound", hint: "" },
          { value: "-24 Units", label: "Net Change", hint: "(inbound - outbound)" },
        ].map((c) => (
          <div
            key={c.label}
            className="bg-white w-full h-[120px] rounded-lg shadow flex flex-col items-start justify-center px-5"
          >
            <p className="text-2xl font-bold font-nunito text-black">
              {c.value}
            </p>
            <p className="text-sm text-gray-600">
              {c.label}{" "}
              {c.hint && <span className="text-gray-400">{c.hint}</span>}
            </p>
          </div>
        ))}
      </div>

      <div className="col-span-9 flex flex-col justify-start items-start gap-4 sm:flex-row sm:justify-between sm:items-start">
        <FilterTabs tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />
      </div>

      <div className="col-span-9 flex flex-col justify-start items-start gap-3 sm:flex-row sm:justify-between sm:items-center">
        <div className="flex gap-2 w-full sm:w-auto items-center">
          <SearchBar
            setSearchInput={setSearchInput}
            value={searchInput}
            placeholder="Search by SKU.."
          />
        </div>

        <div className="flex gap-3 items-center">
          <FilterDropdown
            label="Filter"
            options={PERFORMERS}
            selectedValue={performer}
            onSelect={setPerformer}
          />
          <Button onClick={() => {}} icon={ExportIcon} variant="white">
            Export All
          </Button>
        </div>
      </div>

      <div className="col-span-9">
        <DataTable
          title="Inventory Movement"
          rows={rows}
          columns={columns}
          gridProps={{ checkboxSelection: true }}
        />
      </div>
    </div>
  );
}
