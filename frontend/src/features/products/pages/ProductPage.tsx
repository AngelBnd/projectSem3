import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { MenuItem, Select } from "@mui/material";
import FilterTabs from "../../../components/globalComponents/FilterTabs";
import ColorTag, {
  type TagTone,
} from "../../../components/globalComponents/ColorTag";
import { fetchProductDetail } from "../api";
import {
  longDate,
  percentRange,
  relativeDay,
  rupiah,
  rupiahRange,
  shortDate,
  titleCase,
  type MovementType,
} from "../productDetail";

const TABS = [
  { label: "All" },
  { label: "Inbound" },
  { label: "Outbound" },
  { label: "Adjustments" },
];
const TAB_TYPE: (MovementType | null)[] = [null, "Inbound", "Outbound", "Adjustment"];

const STATUS_TONE: Record<string, TagTone> = {
  ACTIVE: "green",
  INACTIVE: "gray",
  DISCONTINUED: "pink",
};

const ACTIVITY_GRID =
  "grid grid-cols-[1.2fr_1fr_0.8fr_1.2fr_2fr] gap-3 items-center px-4";

function Card({
  title,
  children,
}: {
  title?: string;
  children: ReactNode;
}) {
  return (
    <div className="bg-white rounded-lg shadow p-5">
      {title && <h2 className="text-base font-semibold font-nunito mb-3">{title}</h2>}
      {children}
    </div>
  );
}

function Stat({
  label,
  value,
  className = "",
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <p className="text-xs text-[#777B7C]">{label}</p>
      <p className="text-xl font-nunito">{value}</p>
    </div>
  );
}

function Detail({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="mb-4 last:mb-0">
      <p className="text-xs text-[#777B7C] mb-0.5">{label}</p>
      <div className="text-sm">{children}</div>
    </div>
  );
}

const iconProps = {
  xmlns: "http://www.w3.org/2000/svg",
  width: 20,
  height: 20,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "#3376FC",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export default function ProductPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState(0);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["product", id],
    queryFn: () => fetchProductDetail(id!),
    enabled: !!id,
  });

  const rows = useMemo(() => {
    const type = TAB_TYPE[activeTab];
    return (data?.activity ?? []).filter((r) => !type || r.type === type);
  }, [data, activeTab]);

  if (isLoading) {
    return <p className="text-sm text-[#777B7C] py-10">Loading product...</p>;
  }
  if (isError || !data) {
    return (
      <div className="py-10 text-sm">
        <p className="text-red-500 mb-3">
          {(error as { data?: { error?: string } })?.data?.error ??
            "Could not load this product."}
        </p>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="text-[#3376FC] underline !bg-transparent !p-0"
        >
          Go back
        </button>
      </div>
    );
  }

  const { variant, stock } = { variant: data.variant, stock: data.variant.stock };

  return (
    <div className="grid grid-cols-9 gap-3 w-full text-black mb-10 !overflow-x-hidden">
      {/* Header */}
      <div className="col-span-9 flex flex-col gap-1 mb-2">
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Back"
            onClick={() => navigate(-1)}
            className="!bg-transparent !p-0 flex items-center"
          >
            <svg {...iconProps} stroke="#36383C" width={18} height={18}>
              <circle cx="12" cy="12" r="9" />
              <path d="M13 8l-4 4l4 4" />
            </svg>
          </button>
          <h1 className="text-2xl font-semibold font-nunito">{data.productName}</h1>
          {data.variants.length > 1 && (
            <Select
              size="small"
              value={variant.productVariantId}
              onChange={(e) => navigate(`/products/${e.target.value}`)}
              sx={{
                fontSize: 13,
                bgcolor: "#EAECF0",
                "& fieldset": { border: "none" },
                "& .MuiSelect-select": { py: 0.5 },
              }}
            >
              {data.variants.map((v) => (
                <MenuItem key={v.productVariantId} value={v.productVariantId}>
                  {v.label}
                </MenuItem>
              ))}
            </Select>
          )}

          <div className="ml-auto flex items-center gap-3">
            <button type="button" aria-label="Document" className="!bg-transparent !p-0">
              <svg {...iconProps}>
                <path d="M14 3v4a1 1 0 0 0 1 1h4" />
                <path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z" />
                <path d="M9 13h6" />
                <path d="M9 17h6" />
              </svg>
            </button>
            <button type="button" aria-label="Edit" className="!bg-transparent !p-0">
              <svg {...iconProps}>
                <path d="M7 7h-1a2 2 0 0 0 -2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2 -2v-1" />
                <path d="M20.385 6.585a2.1 2.1 0 0 0 -2.97 -2.97l-8.415 8.385v3h3l8.385 -8.415z" />
                <path d="M16 5l3 3" />
              </svg>
            </button>
          </div>
        </div>
        <p className="text-[#777B7C] text-sm">
          Created {longDate(data.createdAt)} <span className="mx-2">|</span> Last
          Updated {relativeDay(data.updatedAt)}
        </p>
      </div>

      {/* Left column */}
      <div className="col-span-9 lg:col-span-6 flex flex-col gap-3 min-w-0">
        <Card>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {[0, 1, 2, 3].map((i) =>
              data.images[i] ? (
                <img
                  key={i}
                  src={data.images[i]}
                  alt={`${data.productName} ${i + 1}`}
                  className="rounded-lg aspect-[4/3] w-full object-cover bg-[#F3F4F7]"
                />
              ) : (
                <div
                  key={i}
                  className="bg-[#F3F4F7] rounded-lg aspect-[4/3] w-full"
                />
              ),
            )}
          </div>
        </Card>

        <Card title="Pricing">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Stat label="Selling Price" value={rupiah(variant.sellingPrice)} />
            <Stat label="Purchase Price" value={rupiahRange(variant.purchasePrice)} />
            <Stat label="Profit Margin" value={percentRange(variant.margin)} />
          </div>
        </Card>

        <Card title="Stock">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="Available Qty" value={String(stock.available)} />
            <Stat label="Reserved Qty" value={stock.reserved === null ? "—" : String(stock.reserved)} />
            <Stat label="Sold Qty" value={String(stock.sold)} />
            <Stat label="Stock Value" value={stock.value === null ? "—" : `Rp ${stock.value.toLocaleString("id-ID")},-`} />
          </div>
        </Card>

        <Card title="Activity">
          <div className="mb-4">
            <FilterTabs tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-[520px]">
              <div className={`${ACTIVITY_GRID} text-sm pb-2`}>
                <span>Date</span>
                <span>Type</span>
                <span>Qty</span>
                <span>Reason</span>
                <span>Description</span>
              </div>
              <div className="max-h-[260px] overflow-y-auto custom-scrollbar flex flex-col gap-2 pr-2">
                {rows.length === 0 ? (
                  <p className="text-center text-gray-500 py-6 text-sm">
                    No activity found.
                  </p>
                ) : (
                  rows.map((r) => (
                    <div
                      key={r.id}
                      className={`${ACTIVITY_GRID} bg-white rounded shadow py-3 text-sm`}
                    >
                      <span>{shortDate(r.date)}</span>
                      <span>{r.type}</span>
                      <span>{r.qty > 0 ? `+${r.qty}` : r.qty}</span>
                      <span>{r.reason}</span>
                      <span>{r.description}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Right column */}
      <div className="col-span-9 lg:col-span-3 min-w-0 self-start">
        <Card title="Product Details">
          <Detail label="Status">
            <ColorTag
              label={titleCase(variant.productStatus)}
              tone={STATUS_TONE[variant.productStatus] ?? "gray"}
            />
          </Detail>
          <Detail label="SKU">{variant.sku}</Detail>
          <Detail label="Barcode">{variant.barcode || "—"}</Detail>
          <Detail label="Category">{titleCase(data.category)}</Detail>
          <Detail label="Brand">{titleCase(data.brand)}</Detail>
          <Detail label="Description">
            {data.productDescription || "—"}
          </Detail>
        </Card>
      </div>
    </div>
  );
}
