import {
  Checkbox,
  FormControlLabel,
  InputAdornment,
  MenuItem,
  Switch,
  TextField,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

interface SummaryItemType {
  label: string;
  value: string;
}

const fieldSx = {
  "& .MuiOutlinedInput-root": {
    backgroundColor: "#fff",
    borderRadius: "8px",
  },
};

// Placeholder rows so the table structure renders. Replace with your own data.
const variantRows = [
  { id: 1, attr1: "Value1", attr2: "Value1" },
  { id: 2, attr1: "Value2", attr2: "Value1" },
];

const supplierRows = [
  {
    id: 1,
    attr1: "Value1",
    attr2: "Value1",
    suppliers: [{ id: "a" }, { id: "b" }],
  },
  { id: 2, attr1: "Value2", attr2: "Value1", suppliers: [{ id: "a" }] },
];

const PriceInput = ({ className = "" }) => (
  <TextField
    size="small"
    value=""
    name=""
    onChange={() => {}}
    className={className}
    sx={fieldSx}
    InputProps={{
      startAdornment: <InputAdornment position="start">Rp</InputAdornment>,
    }}
  />
);

const NumberInput = () => (
  <TextField
    size="small"
    type="number"
    value=""
    name=""
    onChange={() => {}}
    sx={fieldSx}
    InputProps={{ inputProps: { min: 0 } }}
  />
);

const SupplierSelect = () => (
  <TextField
    select
    fullWidth
    size="small"
    value=""
    name=""
    onChange={() => {}}
    sx={fieldSx}
    SelectProps={{ displayEmpty: true }}
  >
    <MenuItem value="">Supplier</MenuItem>
  </TextField>
);

const SummaryItem = ({ label, value }: SummaryItemType) => (
  <div>
    <div className="text-sm font-nunito font-semibold text-gray-500">
      {label}
    </div>
    <div className="text-lg font-nunito">{value}</div>
  </div>
);

export default function StepPricingStock() {
  return (
    <div>
      <div className="text-sm mb-2 font-nunito font-bold">
        Price &amp; Stock
      </div>

      <div className="border border-gray-300 rounded-md bg-white">
        <div className="grid grid-cols-12 gap-4 px-4 py-3 text-sm text-gray-500 font-nunito">
          <span className="col-span-2">Attribute 1</span>
          <span className="col-span-2">Attribute 2</span>
          <span className="col-span-3">Price</span>
          <span className="col-span-2">Threshold</span>
          <span className="col-span-1">Active</span>
          <span className="col-span-2" />
        </div>

        {variantRows.map((row) => (
          <div
            key={row.id}
            className="grid grid-cols-12 gap-4 items-center px-4 py-3 border-t border-gray-200"
          >
            <span className="col-span-2 text-sm font-nunito">{row.attr1}</span>
            <span className="col-span-2 text-sm font-nunito">{row.attr2}</span>
            <div className="col-span-3">
              <PriceInput />
            </div>
            <div className="col-span-2">
              <NumberInput />
            </div>
            <div className="col-span-1">
              <Switch checked={false} onChange={() => {}} />
            </div>
            <div className="col-span-2">
              <button
                type="button"
                onClick={() => {}}
                className="bg-transparent text-sm text-blue-500 hover:text-blue-600 underline p-0"
              >
                Default
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ---------- Summary ---------- */}
      <div className="grid grid-cols-3 gap-4 mt-6">
        <SummaryItem label="Initial Stock" value="3" />
        <SummaryItem label="Margin" value="3" />
        <SummaryItem label="Profit" value="3" />
      </div>

      {/* ---------- Suppliers & Cost ---------- */}
      <div className="text-sm mt-8 mb-1 font-nunito font-bold">
        Suppliers &amp; Cost
      </div>

      <FormControlLabel
        control={<Checkbox checked={false} onChange={() => {}} />}
        label={<span className="text-sm font-nunito font-bold">Same Cost</span>}
      />

      <div className="border border-gray-300 rounded-md bg-white mt-2">
        <div className="grid grid-cols-12 gap-4 px-4 py-3 text-sm text-gray-500 font-nunito">
          <span className="col-span-1" />
          <span className="col-span-2">Attribute 1</span>
          <span className="col-span-2">Attribute 2</span>
          <span className="col-span-3">Supplier</span>
          <span className="col-span-2">Stock</span>
          <span className="col-span-2">Cost</span>
        </div>

        {supplierRows.map((row) => (
          <div
            key={row.id}
            className="grid grid-cols-12 gap-4 items-start px-4 py-3 border-t border-gray-200"
          >
            {/* Add supplier */}
            <div className="col-span-1 pt-1">
              <button
                type="button"
                onClick={() => {}}
                className="bg-transparent text-blue-500 hover:text-blue-600 p-0"
                aria-label="Add supplier"
              >
                <AddIcon />
              </button>
            </div>

            <span className="col-span-2 text-sm font-nunito pt-2">
              {row.attr1}
            </span>
            <span className="col-span-2 text-sm font-nunito pt-2">
              {row.attr2}
            </span>

            {/* One line per supplier, aligned across the three columns */}
            <div className="col-span-7 flex flex-col gap-2">
              {row.suppliers.map((s) => (
                <div key={s.id} className="grid grid-cols-7 gap-4">
                  <div className="col-span-3">
                    <SupplierSelect />
                  </div>
                  <div className="col-span-2">
                    <NumberInput />
                  </div>
                  <div className="col-span-2">
                    <PriceInput />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
