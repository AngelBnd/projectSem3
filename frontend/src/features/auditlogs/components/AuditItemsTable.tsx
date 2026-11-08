import { TrashIcon } from "../../../assets/SvgIcons";
import { formatDiff, itemDiff, type AuditItem } from "../types";
import ReasonSelect, { ReasonTag } from "./ReasonSelect";

interface AuditItemsTableProps {
  items: AuditItem[];
  /** Without these the table is read-only (review step). */
  onChange?: (productVariantId: number, patch: Partial<AuditItem>) => void;
  onRemove?: (productVariantId: number) => void;
  emptyMessage?: string;
}

const diffColor = (diff: number | null) =>
  diff === null || diff === 0 ? "text-black" : diff > 0 ? "text-green-600" : "text-red-500";

export default function AuditItemsTable({
  items,
  onChange,
  onRemove,
  emptyMessage = "No products added yet.",
}: AuditItemsTableProps) {
  const editable = !!onChange;
  const cols = editable
    ? "grid-cols-[minmax(0,1fr)_72px_64px_56px_150px_28px]"
    : "grid-cols-[minmax(0,1fr)_72px_64px_56px_150px]";

  return (
    <div className="border border-gray-200 rounded-md bg-white font-nunito">
      <div className={`grid ${cols} gap-3 px-4 py-3 text-sm text-gray-500`}>
        <span>Product</span>
        <span>Counted</span>
        <span>In Stock</span>
        <span>Diff</span>
        <span>Reason</span>
        {editable && <span />}
      </div>

      <div className="max-h-[320px] overflow-y-auto custom-scrollbar">
        {items.length === 0 && (
          <div className="px-4 py-8 text-center text-sm text-gray-400 border-t border-gray-200">
            {emptyMessage}
          </div>
        )}

        {items.map((item) => {
          const diff = itemDiff(item);
          const needsReason = diff !== null && diff !== 0 && !item.reason;

          return (
            <div
              key={item.productVariantId}
              className={`grid ${cols} gap-3 items-center px-4 py-2 border-t border-gray-200`}
            >
              <div className="min-w-0 leading-tight">
                <div className="text-sm font-bold text-black truncate">{item.productName}</div>
                <div className="text-xs text-gray-400 truncate">
                  {item.variantLabel || item.sku}
                </div>
              </div>

              {editable ? (
                <input
                  type="number"
                  min={0}
                  step={1}
                  value={item.counted}
                  onChange={(e) => {
                    const v = e.target.value;
                    onChange(item.productVariantId, {
                      counted: v === "" ? "" : Math.max(0, Math.floor(Number(v))),
                    });
                  }}
                  className={`w-14 p-1.5 text-sm text-center border rounded-md bg-white ${
                    item.counted === "" ? "border-red-300" : "border-gray-300"
                  }`}
                  aria-label={`Counted quantity for ${item.productName}`}
                />
              ) : (
                <span className="text-sm font-bold">{item.counted}</span>
              )}

              <span className="text-sm">{item.inStock}</span>
              <span className={`text-sm ${diffColor(diff)}`}>{formatDiff(diff)}</span>

              <div>
                {editable ? (
                  <ReasonSelect
                    value={item.reason}
                    onChange={(reason) => onChange(item.productVariantId, { reason })}
                    error={needsReason}
                  />
                ) : item.reason ? (
                  <ReasonTag reason={item.reason} />
                ) : (
                  <span className="text-sm text-gray-400">—</span>
                )}
              </div>

              {editable && onRemove && (
                <button
                  type="button"
                  onClick={() => onRemove(item.productVariantId)}
                  className="!bg-transparent p-0 text-gray-400 hover:text-red-500"
                  aria-label={`Remove ${item.productName}`}
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
