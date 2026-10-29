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
import { ExportIcon, PlusIcon, ThreeDotsIcon } from "../../../assets/SvgIcons";

type AuditStatus = "Completed" | "Pending Review";

interface AuditRow {
  id: string;
  date: string;
  items: number;
  difference: string;
  status: AuditStatus;
  performedBy: string;
}

const AUDITS: AuditRow[] = [
  {
    id: "AUD-1023",
    date: "20/12/2020",
    items: 123,
    difference: "-2",
    status: "Completed",
    performedBy: "Human",
  },
  {
    id: "AUD-1623",
    date: "23/12/2020",
    items: 23,
    difference: "0",
    status: "Completed",
    performedBy: "NotAHuman",
  },
  {
    id: "AUD-1923",
    date: "29/12/2020",
    items: 512,
    difference: "-2",
    status: "Pending Review",
    performedBy: "NotAHuman",
  },
  {
    id: "AUD-1452",
    date: "30/12/2020",
    items: 12,
    difference: "+2",
    status: "Completed",
    performedBy: "NotAHuman",
  },
  {
    id: "AUD-1888",
    date: "31/12/2020",
    items: 32,
    difference: "-2",
    status: "Pending Review",
    performedBy: "NotAHuman",
  },
];

const STATUS_TONE: Record<AuditStatus, TagTone> = {
  Completed: "green",
  "Pending Review": "yellow",
};

const TABS = [{ label: "All" }, { label: "Completed" }, { label: "Pending" }];
const TAB_STATUS: (AuditStatus | null)[] = [
  null,
  "Completed",
  "Pending Review",
];
const PERFORMERS = ["All", "Human", "NotAHuman"];

const columns: GridColDef<AuditRow>[] = [
  { field: "id", headerName: "Audit ID", flex: 1, minWidth: 120 },
  { field: "date", headerName: "Date", flex: 1, minWidth: 110 },
  { field: "items", headerName: "Items Audited", flex: 1, minWidth: 130 },
  { field: "difference", headerName: "Difference", flex: 1, minWidth: 110 },
  {
    field: "status",
    headerName: "Status",
    flex: 1,
    minWidth: 150,
    renderCell: ({ value }) => (
      <ColorTag label={value} tone={STATUS_TONE[value as AuditStatus]} />
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

export default function AuditLogs() {
  const [searchInput, setSearchInput] = useState("");
  const [activeTab, setActiveTab] = useState(0);
  const [performer, setPerformer] = useState("All");

  const rows = useMemo(() => {
    const q = searchInput.trim().toLowerCase();
    const status = TAB_STATUS[activeTab];
    return AUDITS.filter(
      (r) =>
        (!status || r.status === status) &&
        (performer === "All" || r.performedBy === performer) &&
        (!q || r.id.toLowerCase().includes(q)),
    );
  }, [searchInput, activeTab, performer]);

  return (
    <div className="grid grid-cols-9 gap-3 w-full text-black mb-10 !overflow-x-hidden">
      <div className="col-span-9 flex flex-col mb-2 w-full">
        <h1 className="text-2xl font-semibold font-nunito">Audit Logs</h1>
        <h3 className="text-[#777B7C] text-sm">Overview of your audit logs</h3>
      </div>

      <div className="col-span-9 flex gap-3 mb-2">
        {[
          { value: "27", label: "Total Audits" },
          { value: "Rp 20.000.000,-", label: "Pending Reviews" },
          { value: "+20 Units", label: "Audits with Discrepancy" },
          { value: "-20 Units", label: "Total Adjustments Made" },
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

      <div className="col-span-9 flex flex-col justify-start items-start gap-4 sm:flex-row sm:justify-between sm:items-start">
        <FilterTabs tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />
      </div>

      <div className="col-span-9 flex flex-col justify-start items-start gap-3 sm:flex-row sm:justify-between sm:items-center">
        <div className="flex gap-2 w-full sm:w-auto items-center">
          <SearchBar
            setSearchInput={setSearchInput}
            value={searchInput}
            placeholder="Search by invoice ID.."
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
            Export
          </Button>
          <Button onClick={() => {}} icon={PlusIcon} variant="primary">
            Add Stock Audit
          </Button>
        </div>
      </div>

      <div className="col-span-9">
        <DataTable
          title="Audit Logs"
          rows={rows}
          columns={columns}
          gridProps={{ checkboxSelection: true }}
        />
      </div>
    </div>
  );
}
