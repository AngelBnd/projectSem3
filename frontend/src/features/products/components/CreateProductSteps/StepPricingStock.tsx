import { Dispatch, SetStateAction } from "react";
import {
  Checkbox,
  FormControlLabel,
  InputAdornment,
  MenuItem,
  Autocomplete,
  TextField,
  Switch,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import { fetchSuppliers } from "../../api";

import {
  ProductInfo,
  ProductVariantRow,
  ProductStatus,
  SupplierLine,
} from "../../types"; // adjust paths
import { useQuery } from "@tanstack/react-query";

/* ---------- helpers ---------- */

export const newSupplierLine = (): SupplierLine => ({
  tempId: crypto.randomUUID(),
  supplierId: "",
  supplierName: "",
  stock: "",
  cost: "",
});

const fieldSx = {
  "& .MuiOutlinedInput-root": { backgroundColor: "#fff", borderRadius: "8px" },
};

const rupiah = (n: number) => `Rp ${Math.round(n).toLocaleString("id-ID")}`;
const percent = (n: number) => `${Math.round(n)}%`;
const toNum = (s: string) => (s.trim() === "" ? NaN : Number(s));

// "min–max", or a single value when both ends are equal, or "-" when there's no data
const range = (nums: number[], fmt: (n: number) => string) => {
  if (!nums.length) return "-";
  const lo = Math.min(...nums);
  const hi = Math.max(...nums);
  return lo === hi ? fmt(lo) : `${fmt(lo)}–${fmt(hi)}`;
};

/* ---------- small controlled inputs ---------- */

const PriceInput = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) => (
  <TextField
    fullWidth
    size="small"
    value={value}
    onChange={(e) => onChange(e.target.value.replace(/\D/g, ""))} // digits only
    inputProps={{ inputMode: "numeric" }}
    sx={fieldSx}
    InputProps={{
      startAdornment: <InputAdornment position="start">Rp</InputAdornment>,
    }}
  />
);

const NumberInput = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) => (
  <TextField
    fullWidth
    size="small"
    type="number"
    value={value}
    onChange={(e) => onChange(e.target.value)}
    sx={fieldSx}
    InputProps={{ inputProps: { min: 0 } }}
  />
);

const SupplierInput = ({
  value,
  onChange,
  options,
  usedNames,
}: {
  value: string;
  onChange: (name: string) => void;
  options: string[]; // existing supplier names
  usedNames: string[]; // names already on this variant's other lines (lowercase)
}) => (
  <Autocomplete
    freeSolo
    autoSelect // commits what was typed when the field loses focus
    fullWidth
    size="small"
    options={options}
    value={value}
    getOptionDisabled={(o) => usedNames.includes(o.toLowerCase())}
    onChange={(_, v) => onChange(((v as string | null) ?? "").trim())}
    sx={fieldSx}
    renderInput={(params) => <TextField {...params} placeholder="Supplier" />}
  />
);

const SummaryItem = ({ label, value }: { label: string; value: string }) => (
  <div>
    <div className="text-sm font-nunito font-semibold text-gray-500">
      {label}
    </div>
    <div className="text-lg font-nunito">{value}</div>
  </div>
);

/* ---------- component ---------- */

interface StepPricingStockProps {
  formData: ProductInfo;
  setFormData: Dispatch<SetStateAction<ProductInfo>>;
}

export default function StepPricingStock({
  formData,
  setFormData,
}: StepPricingStockProps) {
  const {
    data: supplierOptions = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["suppliers"],
    queryFn: fetchSuppliers,
  });
  console.log({ supplierOptions, isLoading, isError, error });

  const { variants, sameCost } = formData;

  // One column per attribute; none when the product has no variants
  const validAttrs = formData.hasVariants
    ? formData.attributes.filter((a) => a.name && a.values.length)
    : [];
  const n = validAttrs.length;

  const priceCols = `repeat(${n > 0 ? n : 1}, minmax(50px, 1fr)) 1fr 1fr 1fr 70px`;
  const supplierCols = "1fr 3fr";
  const lineCols = "2fr 2fr 2fr "; // supplier | stock | cost | remove
  const leftCols = `20px repeat(${n}, minmax(0, 1fr))`;
  /* ----- variant-level setters ----- */

  const setVariantField = <K extends keyof ProductVariantRow>(
    tempId: string,
    key: K,
    value: ProductVariantRow[K],
  ) =>
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.map((v) =>
        v.tempId === tempId ? { ...v, [key]: value } : v,
      ),
    }));

  // Only one default variant per product
  const setDefault = (tempId: string) =>
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.map((v) => ({
        ...v,
        isDefault: v.tempId === tempId,
      })),
    }));

  /* ----- supplier-line setters ----- */

  const addSupplier = (variantId: string) =>
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.map((v) =>
        v.tempId === variantId
          ? {
              ...v,
              // with "same cost" on, a new line starts with the shared cost
              suppliers: [
                ...v.suppliers,
                {
                  ...newSupplierLine(),
                  cost: prev.sameCost
                    ? (prev.variants[0]?.suppliers[0]?.cost ?? "")
                    : "",
                },
              ],
            }
          : v,
      ),
    }));

  const removeSupplier = (variantId: string, lineId: string) =>
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.map((v) =>
        v.tempId === variantId
          ? { ...v, suppliers: v.suppliers.filter((s) => s.tempId !== lineId) }
          : v,
      ),
    }));

  const setSupplierField = (
    variantId: string,
    lineId: string,
    key: keyof Omit<SupplierLine, "tempId">,
    value: string,
  ) =>
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.map((v) => ({
        ...v,
        suppliers: v.suppliers.map((s) => {
          if (key === "cost" && prev.sameCost) return { ...s, cost: value };
          return v.tempId === variantId && s.tempId === lineId
            ? { ...s, [key]: value }
            : s;
        }),
      })),
    }));

  const setSupplier = (variantId: string, lineId: string, name: string) => {
    const match = supplierOptions.find(
      (s) => s.name.toLowerCase() === name.toLowerCase(),
    );
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.map((v) =>
        v.tempId !== variantId
          ? v
          : {
              ...v,
              suppliers: v.suppliers.map((s) =>
                s.tempId !== lineId
                  ? s
                  : {
                      ...s,
                      supplierName: match?.name ?? name,
                      supplierId: match ? String(match.id) : "",
                    },
              ),
            },
      ),
    }));
  };

  const handleSameCost = (checked: boolean) =>
    setFormData((prev) => {
      if (!checked) return { ...prev, sameCost: false };
      // turning on: copy the first line's cost to every line
      const first = prev.variants.flatMap((v) => v.suppliers)[0]?.cost ?? "";
      return {
        ...prev,
        sameCost: true,
        variants: prev.variants.map((v) => ({
          ...v,
          suppliers: v.suppliers.map((s) => ({ ...s, cost: first })),
        })),
      };
    });
  /* ----- derived summary (never stored) ----- */

  const initialStock = variants.reduce(
    (sum, v) =>
      sum + v.suppliers.reduce((s, line) => s + (Number(line.stock) || 0), 0),
    0,
  );

  // every (variant price, supplier cost) pair that has both numbers
  const pairs = variants
    .flatMap((v) =>
      v.suppliers.map((line) => ({
        price: toNum(v.sellingPrice),
        cost: toNum(line.cost),
      })),
    )
    .filter(
      (p) => !Number.isNaN(p.price) && !Number.isNaN(p.cost) && p.price > 0,
    );

  const profits = pairs.map((p) => p.price - p.cost);
  const margins = pairs.map((p) => ((p.price - p.cost) / p.price) * 100);
  return (
    <div className="h-full overflow-y-auto">
      {/* ---------- Summary (computed from the form) ---------- */}
      <div className="grid grid-cols-3 gap-4 mb-5">
        <SummaryItem label="Initial Stock" value={String(initialStock)} />
        <SummaryItem label="Margin" value={range(margins, percent)} />
        <SummaryItem label="Profit" value={range(profits, rupiah)} />
      </div>

      {/* ---------- Price & Stock ---------- */}
      <div className="text-sm mb-2 font-nunito font-bold">
        Price &amp; Stock
      </div>

      <div className="border border-gray-300 rounded-md bg-white overflow-x-auto">
        <div
          className="grid gap-8 px-4 py-3"
          style={{ gridTemplateColumns: priceCols }}
        >
          {validAttrs.map((a) => (
            <span className=" flex items-center" key={a.tempId}>
              {a.name}
            </span>
          ))}

          <span className=" ">Price</span>
          <span>Threshold</span>
          <span>Active</span>
        </div>

        {variants.map((v) => (
          <div
            key={v.tempId}
            className="grid gap-2 items-center px-4 py-3 border-t border-gray-200"
            style={{ gridTemplateColumns: priceCols }}
          >
            {validAttrs.map((a) => (
              <span key={a.tempId} className="text-sm font-nunito">
                {v.attributes[a.name]}
              </span>
            ))}

            <PriceInput
              value={v.sellingPrice}
              onChange={(val) => setVariantField(v.tempId, "sellingPrice", val)}
            />
            <NumberInput
              value={v.thresholdStock}
              onChange={(val) =>
                setVariantField(v.tempId, "thresholdStock", val)
              }
            />
            <Switch
              checked={v.productStatus === ProductStatus.ACTIVE}
              onChange={(e) =>
                setVariantField(
                  v.tempId,
                  "productStatus",
                  e.target.checked
                    ? ProductStatus.ACTIVE
                    : ProductStatus.INACTIVE,
                )
              }
            />

            {v.isDefault ? (
              <span className="text-sm font-semibold text-gray-500">
                Default
              </span>
            ) : (
              <button
                type="button"
                onClick={() => setDefault(v.tempId)}
                className="bg-transparent text-sm text-blue-500 hover:text-blue-600 underline p-0 text-left"
              >
                Set default
              </button>
            )}
          </div>
        ))}
      </div>

      {/* ---------- Suppliers & Cost ---------- */}
      <div className="text-sm mt-8 mb-1 font-nunito font-bold">
        Suppliers &amp; Cost
      </div>

      <FormControlLabel
        control={
          <Checkbox
            checked={sameCost}
            onChange={(e) => handleSameCost(e.target.checked)}
          />
        }
        label={<span className="text-sm font-nunito font-bold">Same Cost</span>}
      />
      <div className="border border-gray-300 rounded-md bg-white mt-2 overflow-x-auto">
        <div
          className="grid gap-12 px-4 py-3 text-sm  text-gray-500 font-nunito"
          style={{ gridTemplateColumns: supplierCols }}
        >
          <div
            className="grid gap-8 "
            style={{ gridTemplateColumns: leftCols }}
          >
            <span />
            {validAttrs.map((a) => (
              <span key={a.tempId}>{a.name}</span>
            ))}
          </div>

          <div
            className="grid gap-4  "
            style={{ gridTemplateColumns: lineCols }}
          >
            <span>Supplier</span>
            <span>Stock</span>
            <span>Cost</span>
          </div>
        </div>

        {variants.map((v) => (
          <div
            key={v.tempId}
            className="grid grid-cols-4 gap-12 items-start px-4 py-3 border-t border-gray-200"
            style={{ gridTemplateColumns: supplierCols }}
          >
            <div
              className="grid gap-8 "
              style={{ gridTemplateColumns: leftCols }}
            >
              {/* Add supplier line */}
              <div className="pt-1 col-1">
                <button
                  type="button"
                  onClick={() => addSupplier(v.tempId)}
                  className="bg-transparent text-blue-500 hover:text-blue-600 p-0"
                  aria-label="Add supplier"
                >
                  <AddIcon />
                </button>
              </div>

              {validAttrs.map((a) => (
                <span key={a.tempId} className="text-sm font-nunito pt-2">
                  {v.attributes[a.name]}
                </span>
              ))}
            </div>

            {/* One line per supplier */}
            <div className="flex flex-col gap-2">
              {v.suppliers.map((line) => (
                <div
                  key={line.tempId}
                  className="flex gap-2 justify-around"
                  style={{ gridTemplateColumns: lineCols }}
                >
                  <SupplierInput
                    value={line.supplierName}
                    options={supplierOptions.map((s) => s.name)}
                    usedNames={v.suppliers
                      .filter((l) => l.tempId !== line.tempId)
                      .map((l) => l.supplierName.toLowerCase())}
                    onChange={(name) =>
                      setSupplier(v.tempId, line.tempId, name)
                    }
                  />
                  <NumberInput
                    value={line.stock}
                    onChange={(val) =>
                      setSupplierField(v.tempId, line.tempId, "stock", val)
                    }
                  />
                  <PriceInput
                    value={line.cost}
                    onChange={(val) =>
                      setSupplierField(v.tempId, line.tempId, "cost", val)
                    }
                  />
                  {v.suppliers.length > 1 ? (
                    <button
                      type="button"
                      onClick={() => removeSupplier(v.tempId, line.tempId)}
                      className="bg-transparent p-0 text-gray-500 hover:text-gray-700"
                      aria-label="Remove supplier"
                    >
                      <CloseIcon fontSize="small" />
                    </button>
                  ) : (
                    <span />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
