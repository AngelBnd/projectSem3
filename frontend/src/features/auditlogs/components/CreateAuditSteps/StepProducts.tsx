import { useMemo, useState } from "react";
import { FormControlLabel, Radio } from "@mui/material";
import Button from "../../../../components/globalComponents/Button";
import { PlusIcon, ScanIcon } from "../../../../assets/SvgIcons";
import {
  toAuditItem,
  type AdjustmentMethod,
  type AuditItem,
  type AuditProduct,
  type AuditStepProps,
} from "../../types";
import AuditItemsTable from "../AuditItemsTable";
import AddProductsDialog from "../AddProductsDialog";
import ScanProductsDialog, { type ScannedProduct } from "../ScanProductsDialog";

const METHODS: { value: AdjustmentMethod; label: string }[] = [
  { value: "manual", label: "Manual Entry" },
  { value: "scan", label: "Scan Mode" },
];

export default function StepProducts({ formData, setFormData }: AuditStepProps) {
  const [addOpen, setAddOpen] = useState(false);
  const [scanOpen, setScanOpen] = useState(false);

  const addedIds = useMemo(
    () => new Set(formData.items.map((i) => i.productVariantId)),
    [formData.items],
  );

  const setItem = (productVariantId: number, patch: Partial<AuditItem>) =>
    setFormData((prev) => ({
      ...prev,
      items: prev.items.map((i) =>
        i.productVariantId === productVariantId ? { ...i, ...patch } : i,
      ),
    }));

  const removeItem = (productVariantId: number) =>
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((i) => i.productVariantId !== productVariantId),
    }));

  // Manual entry: new rows start with an empty count to fill in.
  const addProducts = (products: AuditProduct[]) =>
    setFormData((prev) => {
      const have = new Set(prev.items.map((i) => i.productVariantId));
      const fresh = products.filter((p) => !have.has(p.productVariantId));
      return { ...prev, items: [...prev.items, ...fresh.map((p) => toAuditItem(p))] };
    });

  // Scan mode: each scan counts one unit; scanning a listed product adds to its count.
  const addScanned = (scanned: ScannedProduct[]) =>
    setFormData((prev) => {
      const byId = new Map(scanned.map((s) => [s.product.productVariantId, s]));
      const items = prev.items.map((i) => {
        const hit = byId.get(i.productVariantId);
        if (!hit) return i;
        byId.delete(i.productVariantId);
        return { ...i, counted: (i.counted === "" ? 0 : i.counted) + hit.count };
      });
      const fresh = [...byId.values()].map((s) => toAuditItem(s.product, s.count));
      return { ...prev, items: [...items, ...fresh] };
    });

  const isScan = formData.method === "scan";

  return (
    <div className="flex flex-col gap-4">
      {/* Adjustment method */}
      <div className="bg-white rounded-md shadow px-5 py-4">
        <div className="text-sm mb-2 font-nunito font-bold">Adjustment method</div>
        <div className="grid grid-cols-2 gap-3">
          {METHODS.map((m) => {
            const active = formData.method === m.value;
            return (
              <FormControlLabel
                key={m.value}
                value={m.value}
                checked={active}
                onChange={() => setFormData((prev) => ({ ...prev, method: m.value }))}
                control={<Radio size="small" />}
                label={<span className="text-sm font-nunito">{m.label}</span>}
                sx={{ m: 0 }}
                className={`border rounded-md px-2 py-0.5 ${
                  active ? "border-[#3376FC]" : "border-gray-300"
                }`}
              />
            );
          })}
        </div>
      </div>

      {/* Audit items */}
      <div className="bg-white rounded-md shadow px-5 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="text-base font-nunito font-bold">Audit Items</div>
          {isScan ? (
            <Button onClick={() => setScanOpen(true)} icon={ScanIcon} variant="primary">
              Start Scanning
            </Button>
          ) : (
            <Button onClick={() => setAddOpen(true)} icon={PlusIcon} variant="primary">
              Add products
            </Button>
          )}
        </div>

        <AuditItemsTable
          items={formData.items}
          onChange={setItem}
          onRemove={removeItem}
          emptyMessage={
            isScan
              ? "Start scanning to add products to this audit."
              : "Add the products you are counting."
          }
        />
      </div>

      <AddProductsDialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        addedIds={addedIds}
        onAdd={addProducts}
      />
      <ScanProductsDialog
        open={scanOpen}
        onClose={() => setScanOpen(false)}
        onFinish={addScanned}
      />
    </div>
  );
}
